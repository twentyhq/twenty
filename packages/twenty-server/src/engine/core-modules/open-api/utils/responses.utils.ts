import { OpenAPIV3_1 } from 'openapi-types';
import { capitalize } from 'twenty-shared/utils';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const getFindManyResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular' | 'namePlural'>,
  fromMetadata = false,
): OpenAPIV3_1.ResponseObject => {
  const schemaRef = `#/components/schemas/${capitalize(item.namePlural)}ForResponse`;

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
                [item.namePlural]: {
                  type: 'object',
                  properties: {
                    edges: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          node: {
                            $ref: schemaRef,
                          },
                          cursor: {
                            type: 'string',
                          },
                        },
                      },
                    },
                    pageInfo: {
                      type: 'object',
                      properties: {
                        hasNextPage: {
                          type: 'boolean',
                        },
                        hasPreviousPage: {
                          type: 'boolean',
                        },
                        startCursor: {
                          type: 'string',
                        },
                        endCursor: {
                          type: 'string',
                        },
                      },
                    },
                    totalCount: {
                      type: 'number',
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

export const getFindOneResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
): OpenAPIV3_1.ResponseObject => {
  const schemaRef = `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`;

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
): OpenAPIV3_1.ResponseObject => {
  const schemaRef = `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`;

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
                [fromMetadata
                  ? 'createOne' + capitalize(item.nameSingular)
                  : 'create' + capitalize(item.nameSingular)]: {
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
): OpenAPIV3_1.ResponseObject => {
  const schemaRef = `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`;

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
                ['update' + capitalize(item.nameSingular)]: {
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
): OpenAPIV3_1.ResponseObject => {
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
                [fromMetadata
                  ? 'deleteOne' + capitalize(item.nameSingular)
                  : 'delete' + capitalize(item.nameSingular)]: {
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
  item: Pick<ObjectMetadataEntity, 'namePlural'>,
): OpenAPIV3_1.ResponseObject => {
  const schemaRef = `#/components/schemas/${capitalize(item.namePlural)}ForResponse`;

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
                [item.namePlural]: {
                  type: 'object',
                  properties: {
                    edges: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          node: {
                            $ref: schemaRef,
                          },
                          cursor: {
                            type: 'string',
                          },
                        },
                      },
                    },
                    pageInfo: {
                      type: 'object',
                      properties: {
                        hasNextPage: {
                          type: 'boolean',
                        },
                        hasPreviousPage: {
                          type: 'boolean',
                        },
                        startCursor: {
                          type: 'string',
                        },
                        endCursor: {
                          type: 'string',
                        },
                      },
                    },
                    totalCount: {
                      type: 'number',
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
