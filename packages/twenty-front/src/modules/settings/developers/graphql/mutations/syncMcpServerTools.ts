import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/settings/developers/graphql/fragments/mcpServerFragment';

export const SYNC_MCP_SERVER_TOOLS = gql`
  mutation SyncMcpServerTools($id: UUID!) {
    syncMcpServerTools(id: $id) {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
