import { OpenAPIV3 } from 'openapi-types';

export const getErrorResponses = (
  description: string,
): OpenAPIV3.ResponseObject => {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  };
};
