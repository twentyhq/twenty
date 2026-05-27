import gql from 'graphql-tag';

export const SAVE_IMAP_SMTP_CALDAV_ACCOUNT = gql`
  mutation SaveImapSmtpCaldavAccount(
    $handle: String!
    $connectionParameters: EmailAccountConnectionParameters!
    $id: UUID
  ) {
    saveImapSmtpCaldavAccount(
      handle: $handle
      connectionParameters: $connectionParameters
      id: $id
    ) {
      success
      connectedAccountId
    }
  }
`;
