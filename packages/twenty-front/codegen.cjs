module.exports = {
  schema: process.env.REACT_APP_SERVER_BASE_URL + '/graphql',
  documents: [
    '!./src/modules/object-metadata/**',
    '!./src/modules/object-record/**',
    './src/modules/**/*.tsx',
    './src/modules/**/*.ts',
    '!./src/**/*.test.tsx',
    '!./src/**/__mocks__/*.ts',
    '!./src/modules/users/graphql/queries/getCurrentUserAndViews.ts'
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
