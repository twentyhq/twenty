import { gql } from '@apollo/client';

export const REOPEN_INBOX_THREAD_IN_CHANNEL = gql`
  mutation ReopenAgentChatThreadInChannel($threadId: UUID!) {
    reopenAgentChatThreadInChannel(threadId: $threadId)
  }
`;
