import {
  AVAILABLE_WORKSPACE_FOR_AUTH_FRAGMENT,
  AVAILABLE_WORKSPACES_FOR_AUTH_FRAGMENT,
} from '@/auth/graphql/fragments/authFragments';
import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { WORKSPACE_URLS_FRAGMENT } from '@/users/graphql/fragments/workspaceUrlsFragment';
import { DELETED_WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/deletedWorkspaceMemberQueryFragment';
import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  ${ROLE_FRAGMENT}
  ${OBJECT_PERMISSION_FRAGMENT}
  ${WORKSPACE_URLS_FRAGMENT}
  ${AVAILABLE_WORKSPACES_FOR_AUTH_FRAGMENT}
  ${AVAILABLE_WORKSPACE_FOR_AUTH_FRAGMENT}
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
      permissionFlags
      objectRecordsPermissions
      objectPermissions {
        ...ObjectPermissionFragment
      }
      twoFactorAuthenticationMethodSummary {
        twoFactorAuthenticationMethodId
        status
        strategy
      }
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
        ...WorkspaceUrlsFragment
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
        metadata
        billingSubscriptionItems {
          id
          hasReachedCurrentPeriodCap
          quantity
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
        metadata
      }
      workspaceMembersCount
      defaultRole {
        ...RoleFragment
      }
      defaultAgent {
        id
      }
      isTwoFactorAuthenticationEnforced
    }
    availableWorkspaces {
      ...AvailableWorkspacesFragment
    }
    userVars
  }

  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${DELETED_WORKSPACE_MEMBER_QUERY_FRAGMENT}
`;
