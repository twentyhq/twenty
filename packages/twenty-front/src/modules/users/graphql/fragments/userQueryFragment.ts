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
      ...WorkspaceMemberQueryFragment
    }
    workspaceMembers {
      ...WorkspaceMemberQueryFragment
    }
    defaultWorkspace {
      id
      displayName
      logo
      domainName
      inviteHash
      allowImpersonation
      activationStatus
      featureFlags {
        id
        key
        value
        workspaceId
      }
      metadataVersion
      currentBillingSubscription {
        id
        status
        interval
      }
      workspaceMembersCount
      workspaceInvitations {
        id
        email
        expiresAt
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
    userVars
  }
`;
