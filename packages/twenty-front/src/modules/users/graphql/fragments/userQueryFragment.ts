import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  ${ROLE_FRAGMENT}
  fragment UserQueryFragment on User {
    id
    firstName
    lastName
    email
    canAccessFullAdminPanel
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
    currentUserWorkspace {
      settingsPermissions
      objectRecordsPermissions
    }
    currentWorkspace {
      id
      displayName
      logo
      inviteHash
      allowImpersonation
      activationStatus
      isPublicInviteLinkEnabled
      isGoogleAuthEnabled
      isMicrosoftAuthEnabled
      isPasswordAuthEnabled
      subdomain
      hasValidEnterpriseKey
      customDomain
      isCustomDomainEnabled
      workspaceUrls {
        subdomainUrl
        customUrl
      }
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
      billingSubscriptions {
        id
        status
      }
      workspaceMembersCount
      defaultRole {
        ...RoleFragment
      }
    }
    workspaces {
      workspace {
        id
        logo
        displayName
        subdomain
        customDomain
        workspaceUrls {
          subdomainUrl
          customUrl
        }
      }
    }
    userVars
  }

  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
`;
