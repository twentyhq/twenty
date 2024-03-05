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
      activationStatus
      featureFlags {
        id
        key
        value
        workspaceId
      }
    }
    workspaces {
      workspace {
        id
        logo
        displayName
        domainName
      }
    }
  }
`;
