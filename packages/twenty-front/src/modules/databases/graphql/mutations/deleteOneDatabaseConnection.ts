import { gql } from '@apollo/client';

export const DELETE_ONE_DATABASE_CONNECTION = gql`
  mutation deleteServer($input: RemoteServerIdInput!) {
    deleteOneRemoteServer(input: $input) {
      id
    }
  }
`;
