import { gql } from '@apollo/client';

import { USER_INFO_FRAGMENT } from '@/settings/admin-panel/graphql/fragments/userInfoFragment';

export const WORKSPACE_LOOKUP_ADMIN_PANEL = gql`
  ${USER_INFO_FRAGMENT}
  query WorkspaceLookupAdminPanel($workspaceId: UUID!) {
    workspaceLookupAdminPanel(workspaceId: $workspaceId) {
      user {
        ...UserInfoFragment
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
          avatarUrl
        }
        featureFlags {
          key
          value
        }
      }
    }
  }
`;
