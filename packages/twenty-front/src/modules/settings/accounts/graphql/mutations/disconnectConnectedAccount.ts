import { gql } from '@apollo/client';

export const DISCONNECT_CONNECTED_ACCOUNT = gql`
  mutation DisconnectConnectedAccount($id: UUID!) {
    disconnectConnectedAccount(id: $id) {
      id
    }
  }
`;
