import { gql } from '@apollo/client';

export const FIND_ACTIVE_MCP_SERVERS_FOR_MENTION = gql`
  query FindActiveMcpServersForMention {
    activeMcpServers {
      id
      name
      label
    }
  }
`;
