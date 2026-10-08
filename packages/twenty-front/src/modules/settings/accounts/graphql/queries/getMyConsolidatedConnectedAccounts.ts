import { gql } from '@apollo/client';

export const GET_MY_CONSOLIDATED_CONNECTED_ACCOUNTS = gql`
  query MyConsolidatedConnectedAccounts {
    myConnectedAccounts {
      id
      handle
      provider
      applicationId
      connectionProviderId
      userWorkspaceId
      visibility
      name
      authFailedAt
      authFailedReason
      archivedAt
      scopes
      handleAliases
      lastSignedInAt
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
