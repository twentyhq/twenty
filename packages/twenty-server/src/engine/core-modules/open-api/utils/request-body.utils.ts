import { v4 } from 'uuid';

export const getRequestBody = (name: string) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${name}`,
        },
      },
    },
  };
};

export const getUpdateRequestBody = (name: string) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${name}ForUpdate`,
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
              items: {
                type: 'string',
                format: 'uuid',
              },
            },
          },
          example: { ids: [v4()] },
        },
      },
    },
  };
};
