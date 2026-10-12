import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_CHANNEL_ROLES = gql`
  query GetAgentChatChannelRoles {
    agentChatChannelRoles {
      id
      label
      icon
      canAccessAllAgentChatChannels
    }
  }
`;
