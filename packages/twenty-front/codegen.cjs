module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/graphql',
  documents: [
    '!./src/modules/databases/**',
    '!./src/modules/object-metadata/**',
    '!./src/modules/object-record/**',
    '!./src/modules/settings/serverless-functions/**',
    './src/modules/**/*.tsx',
    './src/modules/**/*.ts',
    '!./src/**/*.test.tsx',
    '!./src/**/__mocks__/*.ts',
    '!./src/modules/users/graphql/queries/getCurrentUserAndViews.ts',
  ],
  overwrite: true,
  generates: {
    './src/generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        skipTypename: false,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};
