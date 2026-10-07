import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_INBOX_SUMMARY = gql`
  query GetAgentChatInboxSummary {
    agentChatInboxSummary {
      openCount
      hasUnreadOpen
      needsInputCount
      hasUnreadMention
      hasUnreadAssigned
      channels {
        channelId
        openCount
        hasUnreadOpen
      }
    }
  }
`;
