import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/mcp-servers/graphql/fragments/mcpServerFragment';

export const FIND_ONE_MCP_SERVER = gql`
  query FindOneMcpServer($id: UUID!) {
    mcpServer(id: $id) {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
