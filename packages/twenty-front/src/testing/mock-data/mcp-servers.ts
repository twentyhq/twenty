import {
  type McpServerConnectionFragmentFragment,
  type McpServerFragmentFragment,
} from '~/generated-metadata/graphql';

export const mockedMcpServer: McpServerFragmentFragment = {
  __typename: 'McpServer',
  id: '20202020-6d63-4070-8000-000000000001',
  name: 'linear',
  label: 'Linear',
  url: 'https://mcp.linear.app/mcp',
  connectionProviderId: null,
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

export const mockedMcpServerConnections: McpServerConnectionFragmentFragment[] =
  [
    {
      __typename: 'McpServerConnection',
      id: '20202020-6d63-4070-8000-000000000011',
      handle: 'tim@apple.dev',
      scope: 'USER',
      isOwnedByCurrentUser: true,
      authFailedAt: null,
      createdAt: '2026-11-04T10:00:00.000Z',
    },
    {
      __typename: 'McpServerConnection',
      id: '20202020-6d63-4070-8000-000000000012',
      handle: 'jony@apple.dev',
      scope: 'WORKSPACE',
      isOwnedByCurrentUser: false,
      authFailedAt: '2026-11-05T10:00:00.000Z',
      createdAt: '2026-11-03T10:00:00.000Z',
    },
  ];
