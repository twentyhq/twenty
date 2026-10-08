import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_OPEN_THREADS_SUMMARY = gql`
  query GetAgentChatOpenThreadsSummary {
    agentChatOpenThreadsSummary {
      openThreadCount
      needsInputThreadCount
      hasUnreadOpenThread
      hasUnreadMentionThread
      hasUnreadAssignedThread
    }
  }
`;
