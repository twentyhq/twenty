import { gql } from '@apollo/client';

export const CREATE_MESSAGE_TOPIC = gql`
  mutation CreateMessageTopic($input: CreateMessageTopicInput!) {
    createMessageTopic(input: $input) {
      id
      name
      description
      visibility
    }
  }
`;
