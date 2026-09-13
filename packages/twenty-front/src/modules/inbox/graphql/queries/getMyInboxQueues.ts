import { gql } from '@apollo/client';

export const GET_MY_INBOX_QUEUES = gql`
  query GetMyInboxQueues {
    myInboxQueues {
      id
      name
      slug
      icon
      unread
      needsAction
    }
  }
`;
