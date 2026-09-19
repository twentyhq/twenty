import { gql } from '@apollo/client';

export const GET_CHAT_THREAD_READS = gql`
  query GetChatThreadReads($threadId: UUID!) {
    chatThreadReads(threadId: $threadId) {
      id
      threadId
      userWorkspaceId
      lastReadAt
      lastReadMessageId
    }
  }
`;
