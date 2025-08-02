import gql from 'graphql-tag';

export const GET_CONNECTED_IMAP_SMTP_CALDAV_ACCOUNT = gql`
  query GetConnectedImapSmtpCaldavAccount($id: UUID!) {
    getConnectedImapSmtpCaldavAccount(id: $id) {
      id
      handle
      provider
      accountOwnerId
      connectionParameters {
        IMAP {
          host
          port
          secure
          password
        }
        SMTP {
          host
          port
          secure
          password
        }
        CALDAV {
          host
          username
          password
        }
      }
    }
  }
`;
