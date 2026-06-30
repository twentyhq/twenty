import { gql } from '@apollo/client';

import { USER_INFO_FRAGMENT } from '@/settings/admin-panel/graphql/fragments/userInfoFragment';

export const USER_LOOKUP_ADMIN_PANEL = gql`
  ${USER_INFO_FRAGMENT}
  query UserLookupAdminPanel($userIdentifier: String!) {
    userLookupAdminPanel(userIdentifier: $userIdentifier) {
      user {
        ...UserInfoFragment
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
