import { getFindManyResponse200 } from 'src/engine/core-modules/open-api/utils/responses.utils';

describe('getFindManyResponse200', () => {
  it('documents the direct metadata list envelope and complete page info', () => {
    const response = getFindManyResponse200(
      { nameSingular: 'view', namePlural: 'views' },
      true,
    );
    expect(response).toMatchObject({
      content: {
        'application/json': {
          schema: {
            properties: {
              data: {
                type: 'array',
                items: { $ref: '#/components/schemas/ViewForResponse' },
              },
              pageInfo: {
                properties: {
                  hasNextPage: { type: 'boolean' },
                  hasPreviousPage: { type: 'boolean' },
                  startCursor: { type: ['string', 'null'] },
                  endCursor: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
    });
  });

  it('keeps the workspace record REST envelope nested', () => {
    const response = getFindManyResponse200({
      nameSingular: 'company',
      namePlural: 'companies',
    });

    expect(response).toMatchObject({
      content: {
        'application/json': {
          schema: {
            properties: {
              data: {
                type: 'object',
                properties: {
                  companies: { type: 'array' },
                },
              },
            },
          },
        },
      },
    });
  });
});
