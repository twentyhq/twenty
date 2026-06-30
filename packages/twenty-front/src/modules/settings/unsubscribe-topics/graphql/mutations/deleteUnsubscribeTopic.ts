import { gql } from '@apollo/client';

export const DELETE_UNSUBSCRIBE_TOPIC = gql`
  mutation DeleteUnsubscribeTopic($id: String!) {
    deleteUnsubscribeTopic(id: $id)
  }
`;
