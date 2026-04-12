import { gql } from '@apollo/client';

export const WORKSPACE_LOOKUP_ADMIN_PANEL = gql`
  query WorkspaceLookupAdminPanel($workspaceId: UUID!) {
    workspaceLookupAdminPanel(workspaceId: $workspaceId) {
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
        allowImpersonation
        logo
        totalUsers
        activationStatus
        createdAt
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
