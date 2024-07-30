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

export const getFindDuplicatesRequestBody = () => {
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
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                },
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
        },
      },
    },
  };
};
