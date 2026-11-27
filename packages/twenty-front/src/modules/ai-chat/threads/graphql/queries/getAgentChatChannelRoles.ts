import { gql } from '@apollo/client';

export const GET_INBOX_CHANNEL_ROLES = gql`
  query GetAgentChatChannelRoles {
    agentChatChannelRoles {
      id
      label
      icon
      canAccessAllAgentChatChannels
    }
  }
`;
