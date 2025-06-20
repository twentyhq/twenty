import gql from 'graphql-tag';

export const SAVE_IMAP_CONNECTION = gql`
  mutation SaveImapConnection(
    $accountOwnerId: String!
    $handle: String!
    $host: String!
    $port: Float!
    $secure: Boolean!
    $password: String!
    $id: String
  ) {
    saveImapConnection(
      accountOwnerId: $accountOwnerId
      handle: $handle
      host: $host
      port: $port
      secure: $secure
      password: $password
      id: $id
    ) {
      success
    }
  }
`;
