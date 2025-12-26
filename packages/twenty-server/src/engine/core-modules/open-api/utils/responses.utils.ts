import { capitalize } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getFindManyResponse200 = (
  item: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>,
  fromMetadata = false,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )}ForResponse`;

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
  item: Pick<FlatObjectMetadata, 'nameSingular'>,
) => {
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

export const getRestoreOneResponse200 = (
  item: Pick<FlatObjectMetadata, 'nameSingular'>,
) => {
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
                [`restore${capitalize(item.nameSingular)}`]: {
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

export const getRestoreManyResponse200 = (
  item: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )}ForResponse`;

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
                [`restore${capitalize(item.namePlural)}`]: {
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

export const getCreateOneResponse201 = (
  item: Pick<FlatObjectMetadata, 'nameSingular'>,
  fromMetadata = false,
) => {
  const one = fromMetadata ? 'One' : '';

  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )}ForResponse`;

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
                [`create${one}${capitalize(item.nameSingular)}`]: {
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
  item: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )}ForResponse`;

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
  item: Pick<FlatObjectMetadata, 'nameSingular'>,
  fromMetadata = false,
) => {
  const one = fromMetadata ? 'One' : '';
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

export const getDeleteManyResponse200 = (
  item: Pick<FlatObjectMetadata, 'namePlural'>,
) => {
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
                [`delete${capitalize(item.namePlural)}`]: {
                  type: 'array',
                  items: {
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
    },
  };
};

export const getUpdateManyResponse200 = (
  item: Pick<FlatObjectMetadata, 'namePlural' | 'nameSingular'>,
) => {
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
                [`update${capitalize(item.namePlural)}`]: {
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

export const getDeleteResponse200 = (
  item: Pick<FlatObjectMetadata, 'nameSingular'>,
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
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  description: { type: 'string' },
                },
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
  item: Pick<FlatObjectMetadata, 'nameSingular'>,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )}ForResponse`;

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

export const getMergeManyResponse200 = (
  item: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>,
) => {
  const schemaRef = `#/components/schemas/${capitalize(
    item.nameSingular,
  )}ForResponse`;

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
                [`merge${capitalize(item.namePlural)}`]: {
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
