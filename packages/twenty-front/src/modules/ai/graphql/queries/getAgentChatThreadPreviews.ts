import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_THREAD_PREVIEWS = gql`
  query GetAgentChatThreadPreviews($threadIds: [UUID!]!) {
    agentChatThreadPreviews(threadIds: $threadIds) {
      threadId
      lastMessageRole
      lastMessageText
      lastMessageSenderWorkspaceMemberId
      memberIds
    }
  }
`;
