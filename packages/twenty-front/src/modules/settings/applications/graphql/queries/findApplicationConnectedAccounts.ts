import { gql } from '@apollo/client';

export const FIND_APPLICATION_CONNECTED_ACCOUNTS = gql`
  query ApplicationConnectedAccounts($applicationId: UUID!) {
    applicationConnectedAccounts(applicationId: $applicationId) {
      id
      handle
      authFailedAt
      authFailedReason
      scopes
      lastSignedInAt
      connectionProviderId
      name
      visibility
      lastCredentialsRefreshedAt
      createdAt
      updatedAt
    }
  }
`;
