import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const getManyResultResponse200 = (item: ObjectMetadataEntity) => {
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
                            $ref: `#/components/schemas/${capitalize(
                              item.nameSingular,
                            )}`,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          example: {
            data: {
              properties: {
                [item.namePlural]: {
                  edges: [
                    {
                      node: `${capitalize(item.nameSingular)}Object`,
                    },
                    '...',
                  ],
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getSingleResultSuccessResponse = (item: ObjectMetadataEntity) => {
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
                  $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getDeleteResponse200 = (item) => {
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
        },
      },
    },
  };
};
