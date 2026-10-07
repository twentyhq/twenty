import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_CHANNELS = gql`
  query GetAgentChatChannels {
    agentChatChannels {
      id
      name
      icon
      color
      visibility
      isMember
      canManage
      memberCount
      isSystem
    }
  }
`;
