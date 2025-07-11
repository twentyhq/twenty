import gql from 'graphql-tag';

export const SAVE_IMAP_SMTP_CALDAV_ACCOUNT = gql`
  mutation SaveImapSmtpCaldavAccount(
    $accountOwnerId: String!
    $handle: String!
    $connectionParameters: EmailAccountConnectionParameters!
    $id: String
  ) {
    saveImapSmtpCaldavAccount(
      accountOwnerId: $accountOwnerId
      handle: $handle
      connectionParameters: $connectionParameters
      id: $id
    ) {
      success
    }
  }
`;
