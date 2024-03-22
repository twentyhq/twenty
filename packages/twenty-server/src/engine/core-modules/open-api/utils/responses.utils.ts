import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const getManyResultResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular' | 'namePlural'>,
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
                [item.namePlural]: {
                  type: 'array',
                  items: {
                    $ref: `#/components/schemas/${capitalize(
                      item.nameSingular,
                    )}`,
                  },
                },
              },
            },
          },
          example: {
            data: {
              [item.namePlural]: [
                `${capitalize(item.nameSingular)}Object`,
                '...',
              ],
            },
          },
        },
      },
    },
  };
};

export const getSingleResultSuccessResponse = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
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

export const getDeleteResponse200 = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
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
