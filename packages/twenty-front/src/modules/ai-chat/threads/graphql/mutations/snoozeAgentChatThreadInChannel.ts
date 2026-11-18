import { gql } from '@apollo/client';

export const SNOOZE_INBOX_THREAD_IN_CHANNEL = gql`
  mutation SnoozeAgentChatThreadInChannel(
    $threadId: UUID!
    $snoozedUntil: DateTime!
  ) {
    snoozeAgentChatThreadInChannel(
      threadId: $threadId
      snoozedUntil: $snoozedUntil
    )
  }
`;
