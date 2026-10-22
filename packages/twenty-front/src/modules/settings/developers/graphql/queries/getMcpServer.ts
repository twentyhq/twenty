import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/settings/developers/graphql/fragments/mcpServerFragment';

export const GET_MCP_SERVER = gql`
  query GetMcpServer($id: UUID!) {
    mcpServer(id: $id) {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
