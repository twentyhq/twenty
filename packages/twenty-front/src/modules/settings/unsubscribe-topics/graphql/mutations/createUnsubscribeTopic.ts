import { gql } from '@apollo/client';

export const CREATE_UNSUBSCRIBE_TOPIC = gql`
  mutation CreateUnsubscribeTopic($input: CreateUnsubscribeTopicInput!) {
    createUnsubscribeTopic(input: $input) {
      id
      name
      description
      visibility
    }
  }
`;
