import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/mcp-servers/graphql/fragments/mcpServerFragment';

export const FIND_MANY_MCP_SERVERS = gql`
  query FindManyMcpServers {
    mcpServers {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
