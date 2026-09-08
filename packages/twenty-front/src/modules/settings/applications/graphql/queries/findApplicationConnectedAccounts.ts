import { gql } from '@apollo/client';

export const FIND_APPLICATION_CONNECTED_ACCOUNTS = gql`
  query ApplicationConnectedAccounts($applicationId: UUID!) {
    applicationConnectedAccounts(applicationId: $applicationId) {
      id
      handle
      provider
      authFailedAt
      authFailedReason
      scopes
      lastSignedInAt
      userWorkspaceId
      connectionProviderId
      name
      visibility
      isOwnedByCurrentUser
      lastCredentialsRefreshedAt
      createdAt
      updatedAt
    }
  }
`;
