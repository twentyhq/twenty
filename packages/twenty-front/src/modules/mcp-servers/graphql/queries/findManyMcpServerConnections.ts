import gql from 'graphql-tag';
import { MCP_SERVER_CONNECTION_FRAGMENT } from '@/mcp-servers/graphql/fragments/mcpServerConnectionFragment';

export const FIND_MANY_MCP_SERVER_CONNECTIONS = gql`
  query FindManyMcpServerConnections($mcpServerId: UUID!) {
    mcpServerConnections(mcpServerId: $mcpServerId) {
      ...McpServerConnectionFragment
    }
  }
  ${MCP_SERVER_CONNECTION_FRAGMENT}
`;
