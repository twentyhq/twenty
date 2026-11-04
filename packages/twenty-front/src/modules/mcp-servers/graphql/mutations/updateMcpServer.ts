import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/mcp-servers/graphql/fragments/mcpServerFragment';

export const UPDATE_MCP_SERVER = gql`
  mutation UpdateMcpServer($input: UpdateMcpServerInput!) {
    updateMcpServer(input: $input) {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
