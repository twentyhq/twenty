import gql from 'graphql-tag';

export const GET_CONNECTED_IMAP_ACCOUNT = gql`
  query GetConnectedIMAP_SMTP_CALDEVAccount($id: String!) {
    getConnectedIMAP_SMTP_CALDEVAccount(id: $id) {
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
