import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_INBOX_THREAD_IDS = gql`
  query GetAgentChatInboxThreadIds(
    $view: AgentChatInboxViewInput!
    $first: Int
    $after: String
  ) {
    agentChatInboxThreadIds(view: $view, first: $first, after: $after) {
      threadIds
      hasNextPage
      endCursor
    }
  }
`;
