import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  fragment UserQueryFragment on User {
    id
    firstName
    lastName
    email
    canImpersonate
    supportUserHash
    workspaceMember {
      id
      name {
        firstName
        lastName
      }
      colorScheme
      avatarUrl
      locale
    }
    defaultWorkspace {
      id
      displayName
      logo
      domainName
      inviteHash
      allowImpersonation
      subscriptionStatus
      featureFlags {
        id
        key
        value
        workspaceId
      }
    }
  }
`;
