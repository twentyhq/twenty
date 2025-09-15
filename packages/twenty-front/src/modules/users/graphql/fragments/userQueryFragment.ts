import {
  AVAILABLE_WORKSPACE_FOR_AUTH_FRAGMENT,
  AVAILABLE_WORKSPACES_FOR_AUTH_FRAGMENT,
} from '@/auth/graphql/fragments/authFragments';
import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { WORKSPACE_URLS_FRAGMENT } from '@/users/graphql/fragments/workspaceUrlsFragment';
import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { DELETED_WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/deletedWorkspaceMemberQueryFragment';
import { PARTIAL_WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/partialWorkspaceMemberQueryFragment';
import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';
import { CURRENT_BILLING_SUBSCRIPTION_FRAGMENT } from '@/users/graphql/fragments/currentBillingSubscriptionFragement';
import { BILLING_SUBSCRIPTION_FRAGMENT } from '@/users/graphql/fragments/billingSubscriptionsFragment';

export const USER_QUERY_FRAGMENT = gql`
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
      ...PartialWorkspaceMemberQueryFragment
    }
    deletedWorkspaceMembers {
      ...DeletedWorkspaceMemberQueryFragment
    }
    currentUserWorkspace {
      permissionFlags
      objectsPermissions {
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
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
      workspaceMembersCount
      defaultRole {
        ...RoleFragment
      }
      defaultAgent {
        id
      }
      isTwoFactorAuthenticationEnforced
      views {
        ...ViewFragment
      }
    }
    availableWorkspaces {
      ...AvailableWorkspacesFragment
    }
    userVars
  }

  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${DELETED_WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${PARTIAL_WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${OBJECT_PERMISSION_FRAGMENT}
  ${WORKSPACE_URLS_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${VIEW_FRAGMENT}
  ${AVAILABLE_WORKSPACES_FOR_AUTH_FRAGMENT}
  ${AVAILABLE_WORKSPACE_FOR_AUTH_FRAGMENT}
  ${CURRENT_BILLING_SUBSCRIPTION_FRAGMENT}
  ${BILLING_SUBSCRIPTION_FRAGMENT}
`;
