process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/graphql',
  documents: [
    // Exclude system operations (now handled by metadata codegen)
    '!./src/modules/auth/**',
    '!./src/modules/billing/**',
    '!./src/modules/workspace/**',
    '!./src/modules/workspace-member/**',
    '!./src/modules/workspace-invitation/**',
    '!./src/modules/users/**',
    '!./src/modules/settings/accounts/**',
    '!./src/modules/settings/admin-panel/**',
    '!./src/modules/settings/lab/**',
    '!./src/modules/settings/roles/**',
    '!./src/modules/settings/security/**',
    '!./src/modules/settings/serverless-functions/**',
    '!./src/modules/databases/**',
    '!./src/modules/workflow/**',
    '!./src/modules/analytics/**',
    '!./src/modules/object-metadata/**',
    '!./src/modules/metadata/**',
    
    // Exclude placeholder constants that cause codegen errors, this seems weird
    // may be just exclude enitre constants folder
    '!./src/modules/object-record/constants/Empty*.ts',
    
    // Include core data operations
    './src/modules/**/*.tsx',
    './src/modules/**/*.ts',
    '!./src/**/*.test.ts',
    '!./src/**/*.test.tsx',
    '!./src/**/*.stories.tsx',
    '!./src/**/__mocks__/*.ts',
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
        namingConvention: { enumValues: 'keep' },
      },
    },
  },
};
