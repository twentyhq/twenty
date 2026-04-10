import { gql } from '@apollo/client';

export const GET_CONNECTED_ACCOUNT_BY_ID = gql`
  fragment PublicConnectionParams on PublicConnectionParametersOutput {
    host
    port
    secure
    username
  }

  query ConnectedAccountById($id: UUID!) {
    connectedAccountById(id: $id) {
      id
      handle
      provider
      scopes
      userWorkspaceId
      connectionParameters {
        IMAP {
          ...PublicConnectionParams
        }
        SMTP {
          ...PublicConnectionParams
        }
        CALDAV {
          ...PublicConnectionParams
        }
      }
    }
  }
`;
