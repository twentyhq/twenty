import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_CHANNEL_SUMMARIES = gql`
  query GetAgentChatChannelSummaries {
    agentChatChannelSummaries {
      channelId
      openCount
      hasUnreadOpen
    }
  }
`;
