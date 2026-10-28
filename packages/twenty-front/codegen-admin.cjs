module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/admin-panel',
  documents: [
    './src/modules/settings/admin-panel/**/graphql/**/*.{ts,tsx}',
    './src/modules/settings/application-registrations/graphql/fragments/*.{ts,tsx}',

    '!./src/**/*.test.{ts,tsx}',
    '!./src/**/*.stories.{ts,tsx}',
    '!./src/**/__mocks__/*.ts',
  ],
  overwrite: true,
  config: {
    defaultScalarType: 'any',
    scalars: {
      DateTime: 'string',
      UUID: 'string',
    },
    namingConvention: { enumValues: 'keep' },
    enumType: 'native',
  },
  generates: {
    './src/generated-admin/schema.ts': {
      plugins: ['typescript'],
    },
    './src/generated-admin/graphql.ts': {
      plugins: [
        { add: { content: "export * from './schema';" } },
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        importSchemaTypesFrom: './src/generated-admin/schema',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
      },
    },
  },
};
