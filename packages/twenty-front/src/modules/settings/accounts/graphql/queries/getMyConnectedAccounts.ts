import { gql } from '@apollo/client';

export const GET_MY_CONNECTED_ACCOUNTS = gql`
  query MyConnectedAccounts {
    myConnectedAccounts {
      id
      handle
      provider
      authFailedAt
      archivedAt
      scopes
      handleAliases
      lastSignedInAt
      userWorkspaceId
      connectionProviderId
      name
      visibility
      lastCredentialsRefreshedAt
      connectionParameters {
        IMAP {
          host
          port
          connectionSecurity
          username
        }
        SMTP {
          host
          port
          connectionSecurity
          username
        }
        CALDAV {
          host
          username
        }
      }
      createdAt
      updatedAt
    }
  }
`;
