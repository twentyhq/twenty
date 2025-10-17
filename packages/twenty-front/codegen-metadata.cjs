process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/metadata',
  documents: [
    './src/modules/auth/graphql/**/*.{ts,tsx}',
    './src/modules/users/graphql/**/*.{ts,tsx}',
    './src/modules/views/graphql/**/*.{ts,tsx}',
    './src/modules/ai/graphql/**/*.{ts,tsx}',
    './src/modules/applications/graphql/**/*.{ts,tsx}',
    './src/modules/application-variables/graphql/**/*.{ts,tsx}',

    './src/modules/workspace/graphql/**/*.{ts,tsx}',
    './src/modules/workspace-member/graphql/**/*.{ts,tsx}',
    './src/modules/workspace-invitation/graphql/**/*.{ts,tsx}',

    './src/modules/billing/graphql/**/*.{ts,tsx}',
    './src/modules/settings/**/graphql/**/*.{ts,tsx}',

    './src/modules/databases/graphql/**/*.{ts,tsx}',
    './src/modules/workflow/**/graphql/**/*.{ts,tsx}',
    './src/modules/analytics/graphql/**/*.{ts,tsx}',
    './src/modules/object-metadata/graphql/**/*.{ts,tsx}',
    './src/modules/attachments/graphql/**/*.{ts,tsx}',
    './src/modules/file/graphql/**/*.{ts,tsx}',
    './src/modules/onboarding/graphql/**/*.{ts,tsx}',

    '!./src/**/*.test.{ts,tsx}',
    '!./src/**/*.stories.{ts,tsx}',
    '!./src/**/__mocks__/*.ts',
  ],
  overwrite: true,
  generates: {
    './src/generated-metadata/graphql.ts': {
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
          UUID: 'string',
        },
        namingConvention: { enumValues: 'keep' },
      },
    },
  },
};
