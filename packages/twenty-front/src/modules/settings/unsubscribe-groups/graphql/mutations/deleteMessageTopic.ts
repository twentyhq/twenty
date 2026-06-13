import { gql } from '@apollo/client';

export const DELETE_MESSAGE_TOPIC = gql`
  mutation DeleteMessageTopic($id: String!) {
    deleteMessageTopic(id: $id)
  }
`;
