import { gql } from '@apollo/client';

export const UPDATE_UNSUBSCRIBE_TOPIC = gql`
  mutation UpdateUnsubscribeTopic($input: UpdateUnsubscribeTopicInput!) {
    updateUnsubscribeTopic(input: $input) {
      id
      name
      description
      visibility
    }
  }
`;
