import { gql } from '@apollo/client';

export const UNSUBSCRIBE_TOPICS = gql`
  query UnsubscribeTopics {
    unsubscribeTopics {
      id
      name
      description
      visibility
    }
  }
`;
