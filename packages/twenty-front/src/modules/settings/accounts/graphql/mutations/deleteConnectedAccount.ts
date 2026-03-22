import { gql } from '@apollo/client';

export const DELETE_CONNECTED_ACCOUNT = gql`
  mutation DeleteConnectedAccount($id: UUID!) {
    deleteConnectedAccount(id: $id) {
      id
    }
  }
`;
