import { type OpenAPIV3_1 } from 'openapi-types';

export const get400ErrorResponses = (): OpenAPIV3_1.ResponseObject => {
  return {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            messages: { type: 'array', items: { type: 'string' } },
            error: { type: 'string' },
          },
          example: {
            statusCode: 400,
            message: 'error message',
            error: 'Bad Request',
          },
        },
      },
    },
  };
};

export const get401ErrorResponses = (): OpenAPIV3_1.ResponseObject => {
  return {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            error: { type: 'string' },
          },
          example: {
            statusCode: 401,
            message: 'Token invalid.',
            error: 'Unauthorized',
          },
        },
      },
    },
  };
};
