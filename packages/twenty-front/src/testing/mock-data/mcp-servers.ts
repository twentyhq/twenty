export const mockedMcpServer = {
  __typename: 'McpServer',
  id: '5678',
  name: 'docs',
  label: 'Twenty docs',
  url: 'https://docs.twenty.com/mcp',
  hasAuthorizationHeader: true,
  isEnabled: true,
  tools: [
    {
      __typename: 'McpServerTool',
      name: 'search_twenty_documentation',
      description: 'Search the Twenty documentation',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string' } },
      },
      annotations: { readOnlyHint: true },
    },
  ],
  toolsSyncedAt: '2026-10-22T08:00:00.000Z',
  toolsSyncError: null,
  applicationId: '20202020-64aa-4b6f-b003-9c74b97cee20',
};
