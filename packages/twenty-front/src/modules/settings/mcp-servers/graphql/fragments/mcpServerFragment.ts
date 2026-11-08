import gql from 'graphql-tag';

export const MCP_SERVER_FRAGMENT = gql`
  fragment McpServerFragment on McpServer {
    id
    name
    label
    url
    connectionProviderId
    signInScope
    isActive
    tools {
      name
      description
      inputSchema
      annotations
    }
    toolsSyncedAt
    toolsSyncError
    applicationId
  }
`;
