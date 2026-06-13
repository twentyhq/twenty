import { gql } from '@apollo/client';

export const UPDATE_MESSAGE_TOPIC = gql`
  mutation UpdateMessageTopic($input: UpdateMessageTopicInput!) {
    updateMessageTopic(input: $input) {
      id
      name
      description
      visibility
    }
  }
`;
