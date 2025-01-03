import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  fragment UserQueryFragment on User {
    id
    firstName
    lastName
    email
    canImpersonate
    supportUserHash
    analyticsTinybirdJwts {
      getWebhookAnalytics
      getPageviewsAnalytics
      getUsersAnalytics
      getServerlessFunctionDuration
      getServerlessFunctionSuccessRate
      getServerlessFunctionErrorCount
    }
    onboardingStatus
    workspaceMember {
      ...WorkspaceMemberQueryFragment
    }
    workspaceMembers {
      ...WorkspaceMemberQueryFragment
    }
    currentWorkspace {
      id
      displayName
      logo
      domainName
      inviteHash
      allowImpersonation
      activationStatus
      isPublicInviteLinkEnabled
      isGoogleAuthEnabled
      isMicrosoftAuthEnabled
      isPasswordAuthEnabled
      subdomain
      hasValidEntrepriseKey
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
    }
    workspaces {
      workspace {
        id
        logo
        displayName
        domainName
        subdomain
      }
    }
    userVars
  }

  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
`;
