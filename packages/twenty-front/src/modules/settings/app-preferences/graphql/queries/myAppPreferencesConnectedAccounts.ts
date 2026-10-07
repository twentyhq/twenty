import { gql } from '@apollo/client';

export const MY_APP_PREFERENCES_CONNECTED_ACCOUNTS = gql`
  query MyAppPreferencesConnectedAccounts {
    myConnectedAccounts {
      id
      handle
      name
      provider
      applicationId
      connectionProviderId
      userWorkspaceId
      visibility
      scopes
      archivedAt
      authFailedAt
    }
  }
`;
