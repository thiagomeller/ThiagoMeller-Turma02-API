import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('Mercado API', () => {
  const p = pactum;
  p.request.setDefaultTimeout(90000);

  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com/mercado';

  let mercadoId = 0;
  let frutaId = 0;
  let legumeId = 0;
  const mercadoName = faker.company.name();
  const mercadoCNPJ = faker.string.numeric(14);
  const mercadoEndereco = faker.location.streetAddress();


  beforeAll(async () => p.reporter.add(rep));
  afterAll(async () => p.reporter.end());

  describe("Mercado CRUD", () => {
    it('Get Mercados', async () => {
        await p
          .spec()
          .get(`${baseUrl}`)
          .expectStatus(StatusCodes.OK)
          .expectJsonSchema({
            type: 'array',
            items: {
              properties: {
                endereco: {
                  type: 'string'
                },
                id: {
                  type: 'number'
                },
                nome: {
                  type: 'string'
                },
              },
              required: ['cnpj', 'endereco', 'id', 'nome']
            }
          });
      });
    
      it("Criar Mercado", async () => {
        mercadoId = (await p
            .spec()
            .post(baseUrl)
            .withJson({
                nome: mercadoName,
                endereco: mercadoEndereco,
                cnpj: mercadoCNPJ
            })
            .expectStatus(StatusCodes.CREATED)
        ).body.novoMercado.id
        })
    
        it('Get Mercado por ID', async () => {
            await p
              .spec()
              .get(`${baseUrl}/${mercadoId}`)
              .expectStatus(StatusCodes.OK)
          });
    
        it('Get Mercado por ID inexistente', async () => {
            await p
              .spec()
              .get(`${baseUrl}/777`)
              .expectStatus(StatusCodes.NOT_FOUND)
          });
    
        it('Editar informações de Mercado', async () => {
            await p
                .spec()
                .put(`${baseUrl}/${mercadoId}`)
                .withJson({
                    nome: mercadoName + "AAAA",
                    endereco: mercadoEndereco,
                    cnpj: mercadoCNPJ
                })
                .expectStatus(StatusCodes.OK)
        }); 
    
        it('Editar informações de Mercado inexistente', async () => {
            await p
                .spec()
                .put(`${baseUrl}/777`)
                .expectStatus(StatusCodes.NOT_FOUND)
        });
    
        it('Deletar Mercado inexistente', async () => {
            await p
                .spec()
                .delete(`${baseUrl}/777`)
                .expectStatus(StatusCodes.NOT_FOUND)
        });
  })

  describe("CRUD Produtos", () => {
    it('Get Produtos do Mercado', async () => {
        await p
          .spec()
          .get(`${baseUrl}/${mercadoId}/produtos`)
          .expectStatus(StatusCodes.OK);
    });

    it('Criar Fruta nos Produtos do Mercado', async () => {
        frutaId = (
            await p
                .spec()
                .post(`${baseUrl}/${mercadoId}/produtos/hortifruit/frutas`)
                .withJson({
                    nome: "Kiwi",
                    valor: 20
                })
                .expectStatus(StatusCodes.CREATED)
        ).body.product_item.id;
    });

    it('Get Frutos dos Produtos do Mercado', async () => {
        await p
            .spec()
            .get(`${baseUrl}/${mercadoId}/produtos/hortifruit/frutas`)
            .expectStatus(StatusCodes.OK);
    });

    it('Deletar um Fruto nos Produtos do Mercado', async () => {
        await p
            .spec()
            .delete(`${baseUrl}/${mercadoId}/produtos/hortifruit/frutas/${frutaId}`)
            .withJson({
                nome: "Kiwi",
                valor: 20
            })
            .expectStatus(StatusCodes.OK);  
    });
    
    it('Deletar um Fruto inexistente no Mercado', async () => {
        await p
            .spec()
            .delete(`${baseUrl}/${mercadoId}/produtos/hortifruit/frutas/777`)
            .expectStatus(StatusCodes.NOT_FOUND)
    });

    it('Criar Legume nos Produtos do Mercado', async () => {
        legumeId = (await p
            .spec()
            .post(`${baseUrl}/${mercadoId}/produtos/hortifruit/legumes`)
            .withJson({
                nome: "Pepino",
                valor: 20
            })
            .expectStatus(StatusCodes.CREATED)).body.product_item.id;
    });

    it('Get Legumes dos Produtos do Mercado', async () => {
        await p
            .spec()
            .get(`${baseUrl}/${mercadoId}/produtos/hortifruit/legumes`)
            .expectStatus(StatusCodes.OK);
    });

    it('Deletar um Legume no Mercado', async () => {
        await p
            .spec()
            .delete(`${baseUrl}/${mercadoId}/produtos/hortifruit/legumes/${legumeId}`)
            .expectStatus(StatusCodes.OK)
    });
  })
});
