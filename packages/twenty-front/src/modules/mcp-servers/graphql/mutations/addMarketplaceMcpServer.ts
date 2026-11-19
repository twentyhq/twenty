import gql from 'graphql-tag';
import { MCP_SERVER_FRAGMENT } from '@/mcp-servers/graphql/fragments/mcpServerFragment';

export const ADD_MARKETPLACE_MCP_SERVER = gql`
  mutation AddMarketplaceMcpServer($universalIdentifier: String!) {
    addMarketplaceMcpServer(universalIdentifier: $universalIdentifier) {
      ...McpServerFragment
    }
  }
  ${MCP_SERVER_FRAGMENT}
`;
