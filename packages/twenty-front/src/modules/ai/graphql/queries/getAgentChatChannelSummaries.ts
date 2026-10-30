import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_CHANNEL_SUMMARIES = gql`
  query GetAgentChatChannelSummaries {
    agentChatChannelSummaries {
      channelId
      openCount
      needsInputCount
      mentionedCount
      hasUnreadOpen
      assignedToMeCount
      assignedCount
      unassignedCount
      hasUnreadAssignedToMe
      snoozedCount
      doneCount
    }
  }
`;
