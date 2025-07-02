import gql from 'graphql-tag';

export const GET_CONNECTED_IMAP_SMTP_CALDAV_ACCOUNT = gql`
  query GetConnectedImapSmtpCaldavAccount($id: String!) {
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
          username
          password
        }
        SMTP {
          host
          port
          secure
          username
          password
        }
        CALDAV {
          host
          port
          secure
          username
          password
        }
      }
    }
  }
`;
