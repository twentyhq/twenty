import { capitalize } from 'twenty-shared/utils';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const getFindManyResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular' | 'namePlural'>,
  fromMetadata = false,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )} for Response`;

  const namePlural =
    item.namePlural === 'relations' ? 'relationMetadata' : item.namePlural;

  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [namePlural]: {
                  type: 'array',
                  items: {
                    $ref: schemaRef,
                  },
                },
              },
            },
            pageInfo: {
              type: 'object',
              properties: {
                hasNextPage: { type: 'boolean' },
                startCursor: {
                  type: 'string',
                  format: 'uuid',
                },
                endCursor: {
                  type: 'string',
                  format: 'uuid',
                },
              },
            },
            ...(!fromMetadata && {
              totalCount: {
                type: 'integer',
              },
            }),
          },
        },
      },
    },
  };
};

export const getFindOneResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
) => {
  const schemaRef = `#/components/schemas/${capitalize(item.nameSingular)} for Response`;

  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [item.nameSingular]: {
                  $ref: schemaRef,
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getCreateOneResponse201 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
  fromMetadata = false,
) => {
  const one = fromMetadata ? 'One' : '';

  const nameSingular =
    item.nameSingular === 'relation' ? 'relationMetadata' : item.nameSingular;

  const schemaRef = `#/components/schemas/${capitalize(nameSingular)} for Response`;

  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [`create${one}${capitalize(nameSingular)}`]: {
                  $ref: schemaRef,
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getCreateManyResponse201 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular' | 'namePlural'>,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )} for Response`;

  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [`create${capitalize(item.namePlural)}`]: {
                  type: 'array',
                  items: {
                    $ref: schemaRef,
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getUpdateOneResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
  fromMetadata = false,
) => {
  const one = fromMetadata ? 'One' : '';
  const schemaRef = `#/components/schemas/${capitalize(item.nameSingular)} for Response`;

  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [`update${one}${capitalize(item.nameSingular)}`]: {
                  $ref: schemaRef,
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getDeleteResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
  fromMetadata = false,
) => {
  const one = fromMetadata ? 'One' : '';

  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [`delete${one}${capitalize(item.nameSingular)}`]: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getJsonResponse = () => {
  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            openapi: { type: 'string' },
            info: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                termsOfService: { type: 'string' },
                contact: {
                  type: 'object',
                  properties: { email: { type: 'string' } },
                },
                license: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
            },
            servers: {
              type: 'array',
              items: {
                url: { type: 'string' },
                description: { type: 'string' },
              },
            },
            components: {
              type: 'object',
              properties: {
                schemas: { type: 'object' },
                parameters: { type: 'object' },
                responses: { type: 'object' },
              },
            },
            paths: {
              type: 'object',
            },
            tags: {
              type: 'object',
            },
          },
        },
      },
    },
  };
};

export const getFindDuplicatesResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )} for Response`;

  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  totalCount: { type: 'number' },
                  pageInfo: {
                    type: 'object',
                    properties: {
                      hasNextPage: { type: 'boolean' },
                      startCursor: {
                        type: 'string',
                        format: 'uuid',
                      },
                      endCursor: {
                        type: 'string',
                        format: 'uuid',
                      },
                    },
                  },
                  [`${item.nameSingular}Duplicates`]: {
                    type: 'array',
                    items: {
                      $ref: schemaRef,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};
