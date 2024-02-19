import { OpenAPIV3_1 } from 'openapi-types';

export const getErrorResponses = (
  description: string,
): OpenAPIV3_1.ResponseObject => {
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
