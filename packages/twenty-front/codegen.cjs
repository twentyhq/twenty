process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/graphql',
  documents: [
    './src/modules/workflow/**/graphql/**/*.{ts,tsx}',
    './src/modules/object-core/**/graphql/**/*.{ts,tsx}',
    './src/modules/activities/emails/graphql/queries/**/*.{ts,tsx}',
    './src/modules/activities/emails/graphql/operation-signatures/**/*.{ts,tsx}',
    './src/modules/activities/calendar/graphql/queries/**/*.{ts,tsx}',
    './src/modules/command-menu/graphql/**/*.{ts,tsx}',
    './src/modules/ai/graphql/mutations/answerToolCall.ts',

    '!./src/**/*.test.{ts,tsx}',
    '!./src/**/*.stories.{ts,tsx}',
    '!./src/**/__mocks__/*.ts',
  ],
  overwrite: true,
  config: {
    defaultScalarType: 'any',
    scalars: {
      DateTime: 'string',
    },
    namingConvention: { enumValues: 'keep' },
    enumType: 'native',
  },
  generates: {
    './src/generated/schema.ts': {
      plugins: ['typescript'],
    },
    './src/generated/graphql.ts': {
      plugins: [
        { add: { content: "export * from './schema';" } },
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        importSchemaTypesFrom: './src/generated/schema',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
      },
    },
  },
};
