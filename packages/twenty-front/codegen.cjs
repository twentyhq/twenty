process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/graphql',
  documents: [
    './src/modules/workflow/**/graphql/**/*.{ts,tsx}',
    './src/modules/activities/emails/graphql/**/*.{ts,tsx}',
    './src/modules/activities/calendar/graphql/**/*.{ts,tsx}',
    './src/modules/search/graphql/**/*.{ts,tsx}',
    './src/modules/command-menu/graphql/**/*.{ts,tsx}',

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
