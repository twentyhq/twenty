import gql from 'graphql-tag';

export const FIND_MANY_MCP_SERVERS = gql`
  query FindManyMcpServers {
    mcpServers {
      id
      name
      label
      url
      connectionProviderId
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
  }
`;
