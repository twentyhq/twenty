import { gql } from '@apollo/client';

export const MARK_MESSAGE_THREAD_AS_READ = gql`
  mutation MarkMessageThreadAsRead($messageThreadId: UUID!) {
    markMessageThreadAsRead(messageThreadId: $messageThreadId)
  }
`;
