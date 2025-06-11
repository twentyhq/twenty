import { OpenAPIV3_1 } from 'openapi-types';

export const getRequestBody = (
  name: string,
  propertyName = `${name}CreationInput`,
): OpenAPIV3_1.RequestBodyObject => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              $ref: `#/components/schemas/${name}`,
            },
          },
        },
      },
    },
  };
};

export const getUpdateRequestBody = (
  name: string,
): OpenAPIV3_1.RequestBodyObject => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              $ref: `#/components/schemas/${name}ForUpdate`,
            },
          },
        },
      },
    },
  };
};

export const getArrayRequestBody = (name: string) => {
  return {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            $ref: `#/components/schemas/${name}`,
          },
        },
      },
    },
  };
};

export const getFindDuplicatesRequestBody = (name: string) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: `#/components/schemas/${name}`,
              },
            },
            ids: {
              type: 'array',
            },
          },
        },
      },
    },
  };
};
