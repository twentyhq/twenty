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
          $ref: `#/components/schemas/${name} for Update`,
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
