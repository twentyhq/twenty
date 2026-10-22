import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/settings/developers/graphql/fragments/mcpServerFragment';

export const GET_MCP_SERVERS = gql`
  query GetMcpServers {
    mcpServers {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
