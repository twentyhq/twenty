import gql from 'graphql-tag';

export const SAVE_IMAP_CONNECTION = gql`
  mutation SaveIMAP_SMTP_CALDEV(
    $accountOwnerId: String!
    $handle: String!
    $accountType: AccountType!
    $connectionParameters: ConnectionParameters!
    $id: String
  ) {
    saveIMAP_SMTP_CALDEV(
      accountOwnerId: $accountOwnerId
      handle: $handle
      accountType: $accountType
      connectionParameters: $connectionParameters
      id: $id
    ) {
      success
    }
  }
`;
