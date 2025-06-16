import gql from 'graphql-tag';

export const GET_CONNECTED_IMAP_ACCOUNT = gql`
  query GetConnectedImapAccount($id: String!) {
    getConnectedImapAccount(id: $id) {
      id
      handle
      provider
      accountOwnerId
      connectionParameters {
        handle
        host
        port
        secure
        password
      }
    }
  }
`;
