import {
  type ApplicationConnectionProviderFragmentFragment,
  ConnectedAccountScope,
  ConnectionProviderScope,
  type McpServerFragmentFragment,
  type MyConnectedAccountsQuery,
} from '~/generated-metadata/graphql';

export const mockedMcpServer: McpServerFragmentFragment = {
  __typename: 'McpServer',
  id: '20202020-6d63-4070-8000-000000000001',
  name: 'linear',
  label: 'Linear',
  url: 'https://mcp.linear.app/mcp',
  connectionProviderId: null,
  signInScope: null,
  isActive: true,
  toolsSyncedAt: '2026-11-04T10:00:00.000Z',
  toolsSyncError: null,
  applicationId: '20202020-6d63-4070-8000-000000000002',
  tools: [
    {
      __typename: 'McpServerTool',
      name: 'search_issues',
      description: 'Search issues by text',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string' } },
      },
      annotations: { readOnlyHint: true },
    },
    {
      __typename: 'McpServerTool',
      name: 'delete_issue',
      description: 'Delete an issue',
      inputSchema: { type: 'object', properties: { id: { type: 'string' } } },
      annotations: { destructiveHint: true },
    },
  ],
};

export const mockedMcpServerSignInConnectionProvider: ApplicationConnectionProviderFragmentFragment =
  {
    __typename: 'ApplicationConnectionProvider',
    id: '20202020-6d63-4070-8000-000000000021',
    applicationId: mockedMcpServer.applicationId,
    type: 'oauth-discovery',
    name: 'mcp-linear',
    displayName: 'Linear',
    scope: ConnectionProviderScope.USER,
    logoUrl: null,
    oauth: null,
  };

export const mockedMcpServerSignInUserWorkspaceId =
  '20202020-6d63-4070-8000-000000000031';

export const mockedMcpServerSignInConnectedAccounts: MyConnectedAccountsQuery['myConnectedAccounts'] =
  [
    {
      __typename: 'ConnectedAccountPublicDTO',
      id: '20202020-6d63-4070-8000-000000000011',
      handle: 'tim@apple.dev',
      provider: 'app',
      authFailedAt: null,
      authFailedReason: null,
      archivedAt: null,
      scopes: ['read'],
      handleAliases: null,
      lastSignedInAt: null,
      userWorkspaceId: mockedMcpServerSignInUserWorkspaceId,
      connectionProviderId: mockedMcpServerSignInConnectionProvider.id,
      applicationId: mockedMcpServer.applicationId,
      name: null,
      scope: ConnectedAccountScope.USER,
      lastCredentialsRefreshedAt: '2026-11-04T10:00:00.000Z',
      connectionParameters: null,
      createdAt: '2026-11-04T10:00:00.000Z',
      updatedAt: '2026-11-04T10:00:00.000Z',
    },
  ];
