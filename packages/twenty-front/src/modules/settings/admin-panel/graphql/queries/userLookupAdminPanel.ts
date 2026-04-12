import { gql } from '@apollo/client';

export const USER_LOOKUP_ADMIN_PANEL = gql`
  query UserLookupAdminPanel($userIdentifier: String!) {
    userLookupAdminPanel(userIdentifier: $userIdentifier) {
      user {
        id
        email
        firstName
        lastName
        createdAt
      }
      workspaces {
        id
        name
        logo
        totalUsers
        activationStatus
        createdAt
        allowImpersonation
        workspaceUrls {
          customUrl
          subdomainUrl
        }
        users {
          id
          email
          firstName
          lastName
        }
        featureFlags {
          key
          value
        }
      }
    }
  }
`;
