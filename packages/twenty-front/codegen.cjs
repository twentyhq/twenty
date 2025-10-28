process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/graphql',
  documents: [
    './src/modules/activities/graphql/**/*.{ts,tsx}',
    './src/modules/companies/graphql/**/*.{ts,tsx}',
    './src/modules/people/graphql/**/*.{ts,tsx}',
    './src/modules/opportunities/graphql/**/*.{ts,tsx}',

    './src/modules/search/graphql/**/*.{ts,tsx}',
    './src/modules/views/graphql/**/*.{ts,tsx}',
    './src/modules/favorites/graphql/**/*.{ts,tsx}',
    './src/modules/spreadsheet-import/graphql/**/*.{ts,tsx}',
    './src/modules/command-menu/graphql/**/*.{ts,tsx}',

    './src/modules/prefetch/graphql/**/*.{ts,tsx}',
    './src/modules/subscription/graphql/**/*.{ts,tsx}',

    './src/modules/page-layout/graphql/**/*.{ts,tsx}',

    '!./src/**/*.test.{ts,tsx}',
    '!./src/**/*.stories.{ts,tsx}',
    '!./src/**/__mocks__/*.ts',
  ],
  overwrite: true,
  generates: {
    './src/generated/graphql.ts': {
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
        namingConvention: { enumValues: 'keep' },
      },
    },
  },
};
