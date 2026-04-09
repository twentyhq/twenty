import { gql } from '@apollo/client';

export const GET_MY_CONNECTED_ACCOUNTS = gql`
  query MyConnectedAccounts {
    myConnectedAccounts {
      id
      handle
      provider
      authFailedAt
      scopes
      handleAliases
      lastSignedInAt
      userWorkspaceId
      createdAt
      updatedAt
    }
  }
`;
