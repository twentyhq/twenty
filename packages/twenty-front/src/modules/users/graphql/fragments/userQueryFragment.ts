import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { DELETED_WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/deletedWorkspaceMemberQueryFragment';
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
    onboardingStatus
    workspaceMember {
      ...WorkspaceMemberQueryFragment
    }
    workspaceMembers {
      ...WorkspaceMemberQueryFragment
    }
    deletedWorkspaceMembers {
      ...DeletedWorkspaceMemberQueryFragment
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
      creatorEmail
      hasValidEnterpriseKey
      customDomain
      isCustomDomainEnabled
      workspaceUrls {
        subdomainUrl
        customUrl
      }
      featureFlags {
        key
        value
      }
      metadataVersion
      currentBillingSubscription {
        id
        status
        interval
        billingSubscriptionItems {
          id
          hasReachedCurrentPeriodCap
          billingProduct {
            name
            description
            metadata {
              planKey
              priceUsageBased
              productKey
            }
          }
        }
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
  ${DELETED_WORKSPACE_MEMBER_QUERY_FRAGMENT}
`;
