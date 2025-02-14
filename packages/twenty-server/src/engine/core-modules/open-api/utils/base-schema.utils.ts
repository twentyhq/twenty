import { OpenAPIV3_1 } from 'openapi-types';

import { computeOpenApiPath } from 'src/engine/core-modules/open-api/utils/path.utils';

export const API_Version = 'v0.1';

export const baseSchema = (
  schemaName: 'core' | 'metadata',
  serverUrl: string,
): OpenAPIV3_1.Document => {
  return {
    openapi: '3.1.1',
    info: {
      title: 'Twenty Api',
      description: `This is a **Twenty REST/API** playground based on the **OpenAPI 3.1 specification**.`,
      termsOfService:
        'https://github.com/twentyhq/twenty?tab=coc-ov-file#readme',
      contact: {
        email: 'felix@twenty.com',
      },
      license: {
        name: 'AGPL-3.0',
        url: 'https://github.com/twentyhq/twenty?tab=License-1-ov-file#readme',
      },
      version: API_Version,
    },
    // Testing purposes
    servers: [
      {
        url: `${serverUrl}/rest/${schemaName !== 'core' ? schemaName : ''}`,
        description: 'Production Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter the token with the `Bearer: ` prefix, e.g. "Bearer abcde12345".',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    externalDocs: {
      description: 'Find out more about **Twenty**',
      url: 'https://twenty.com',
    },
    paths: { [`/open-api/${schemaName}`]: computeOpenApiPath(serverUrl) },
  };
};
