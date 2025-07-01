process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = {
  schema:
    (process.env.REACT_APP_SERVER_BASE_URL ?? 'http://localhost:3000') +
    '/metadata',
  documents: [
    // Authentication
    './src/modules/auth/graphql/**/*.ts',
    
    // Billing
    './src/modules/billing/graphql/**/*.ts',
    
    // Workspace Management
    './src/modules/workspace/graphql/**/*.ts',
    './src/modules/workspace-member/graphql/**/*.ts',
    './src/modules/workspace-invitation/graphql/**/*.ts',
    
    // User Management
    './src/modules/users/graphql/**/*.ts',
    
    // Settings & Administration
    './src/modules/settings/accounts/graphql/**/*.ts',
    './src/modules/settings/admin-panel/graphql/**/*.ts',
    './src/modules/settings/admin-panel/config-variables/graphql/**/*.ts',
    './src/modules/settings/admin-panel/health-status/graphql/**/*.ts',
    './src/modules/settings/lab/graphql/**/*.ts',
    './src/modules/settings/roles/graphql/**/*.ts',
    './src/modules/settings/security/graphql/**/*.ts',
    './src/modules/settings/serverless-functions/graphql/**/*.ts',
    
    // Database Connections
    './src/modules/databases/graphql/**/*.ts',
    
    // Workflow Management (including nested workflow-steps)
    './src/modules/workflow/**/graphql/**/*.ts',
    
    // Analytics & Tracking
    './src/modules/analytics/graphql/**/*.ts',
    
    // Metadata Operations
    './src/modules/object-metadata/graphql/*.ts',
    './src/modules/metadata/graphql/*.ts',
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
        },
        namingConvention: { enumValues: 'keep' },
      },
    },
  },
};
