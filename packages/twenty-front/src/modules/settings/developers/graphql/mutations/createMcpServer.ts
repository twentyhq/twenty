import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/settings/developers/graphql/fragments/mcpServerFragment';

export const CREATE_MCP_SERVER = gql`
  mutation CreateMcpServer($input: CreateMcpServerInput!) {
    createMcpServer(input: $input) {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
