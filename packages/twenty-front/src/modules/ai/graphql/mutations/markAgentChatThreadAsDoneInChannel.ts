import { gql } from '@apollo/client';

export const MARK_INBOX_THREAD_AS_DONE_IN_CHANNEL = gql`
  mutation MarkAgentChatThreadAsDoneInChannel($threadId: UUID!) {
    markAgentChatThreadAsDoneInChannel(threadId: $threadId)
  }
`;
