import { gql } from '@apollo/client';

export const GET_MY_INBOX_COUNTS = gql`
  query GetMyInboxCounts($queueSlug: String) {
    myInboxCounts(queueSlug: $queueSlug) {
      unread
      needsAction
      snoozed
    }
  }
`;
