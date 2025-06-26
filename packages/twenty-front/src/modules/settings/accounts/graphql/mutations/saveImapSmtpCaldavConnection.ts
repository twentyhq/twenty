import gql from 'graphql-tag';

export const SAVE_IMAP_SMTP_CALDAV_CONNECTION = gql`
  mutation SaveImapSmtpCaldav(
    $accountOwnerId: String!
    $handle: String!
    $accountType: AccountType!
    $connectionParameters: ConnectionParameters!
    $id: String
  ) {
    saveImapSmtpCaldav(
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
