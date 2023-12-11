export const baseSchema = (frontBaseUrl: string): { [key: string]: any } => {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Twenty Api',
      description: `This is a twenty REST/API playground based on the OpenAPI 3.0 specification.\n\nTo use the Playground, please log to your twenty account and generate an API key here: here: ${frontBaseUrl}/settings/developers/api-keys`,
      termsOfService: 'https://github.com/twentyhq/twenty?tab=coc-ov-file',
      contact: {
        email: 'felix@twenty.com',
      },
      license: {
        name: 'AGPL-3.0',
        url: 'https://github.com/twentyhq/twenty?tab=AGPL-3.0-1-ov-file#readme',
      },
      version: '0.2.0',
    },
    // Testing purposes
    servers: [
      {
        url: 'http://localhost:3000',
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
      description: 'Find out more about Twenty',
      url: 'https://twenty.com',
    },
    tags: [
      {
        name: 'companies',
        description: 'Everything about your Companies',
      },
    ],
  };
};
