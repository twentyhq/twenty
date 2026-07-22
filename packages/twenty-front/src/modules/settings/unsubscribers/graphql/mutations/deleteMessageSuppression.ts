import { gql } from '@apollo/client';

export const DELETE_MESSAGE_SUPPRESSION = gql`
  mutation DeleteMessageSuppression($id: String!) {
    deleteMessageSuppression(id: $id)
  }
`;
