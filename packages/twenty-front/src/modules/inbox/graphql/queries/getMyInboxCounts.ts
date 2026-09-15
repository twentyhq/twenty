import { gql } from '@apollo/client';

export const GET_MY_INBOX_COUNTS = gql`
  query GetMyInboxCounts($queueName: String) {
    myInboxCounts(queueName: $queueName) {
      unread
      needsAction
      snoozed
    }
  }
`;
