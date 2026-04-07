import gql from 'graphql-tag';

export const GET_CONNECTED_IMAP_SMTP_CALDAV_ACCOUNT = gql`
  query GetConnectedImapSmtpCaldavAccount($id: UUID!) {
    getConnectedImapSmtpCaldavAccount(id: $id) {
      id
      handle
      provider
      userWorkspaceId
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
          username
          port
          secure
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
