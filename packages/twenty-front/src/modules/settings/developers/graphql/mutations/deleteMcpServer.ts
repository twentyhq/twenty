import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/settings/developers/graphql/fragments/mcpServerFragment';

export const DELETE_MCP_SERVER = gql`
  mutation DeleteMcpServer($id: UUID!) {
    deleteMcpServer(id: $id) {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
