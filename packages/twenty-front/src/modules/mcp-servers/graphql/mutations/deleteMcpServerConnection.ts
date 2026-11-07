import gql from 'graphql-tag';
import { MCP_SERVER_CONNECTION_FRAGMENT } from '@/mcp-servers/graphql/fragments/mcpServerConnectionFragment';

export const DELETE_MCP_SERVER_CONNECTION = gql`
  mutation DeleteMcpServerConnection($id: UUID!) {
    deleteMcpServerConnection(id: $id) {
      ...McpServerConnectionFragment
    }
  }
  ${MCP_SERVER_CONNECTION_FRAGMENT}
`;
