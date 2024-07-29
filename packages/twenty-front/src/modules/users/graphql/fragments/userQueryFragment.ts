import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  fragment UserQueryFragment on User {
    id
    firstName
    lastName
    email
    canImpersonate
    supportUserHash
    onboardingStatus
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
      domainName {
        primaryLinkUrl
        primaryLinkLabel
      }
      inviteHash
      allowImpersonation
      activationStatus
      featureFlags {
        id
        key
        value
        workspaceId
      }
      currentCacheVersion
      currentBillingSubscription {
        id
        status
        interval
      }
      workspaceMembersCount
    }
    workspaces {
      workspace {
        id
        logo
        displayName
        domainName
      }
    }
    userVars
  }
`;
