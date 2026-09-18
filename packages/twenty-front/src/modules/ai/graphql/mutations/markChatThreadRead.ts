import { gql } from '@apollo/client';

export const MARK_CHAT_THREAD_READ = gql`
  mutation MarkChatThreadRead($threadId: UUID!) {
    markChatThreadRead(threadId: $threadId) {
      id
      threadId
      userWorkspaceId
      lastReadAt
      lastReadMessageId
    }
  }
`;
