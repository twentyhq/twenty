import { createState } from 'twenty-ui/utilities';
import { type Role, type Workspace } from '~/generated/graphql';

export type CurrentWorkspace = Pick<
  Workspace,
  | 'id'
  | 'inviteHash'
  | 'logo'
  | 'displayName'
  | 'allowImpersonation'
  | 'featureFlags'
  | 'activationStatus'
  | 'billingSubscriptions'
  | 'currentBillingSubscription'
  | 'workspaceMembersCount'
  | 'isPublicInviteLinkEnabled'
  | 'isGoogleAuthEnabled'
  | 'isGoogleAuthBypassEnabled'
  | 'isMicrosoftAuthEnabled'
  | 'isMicrosoftAuthBypassEnabled'
  | 'isPasswordAuthEnabled'
  | 'isPasswordAuthBypassEnabled'
  | 'isCustomDomainEnabled'
  | 'hasValidEnterpriseKey'
  | 'subdomain'
  | 'customDomain'
  | 'workspaceUrls'
  | 'metadataVersion'
  | 'isTwoFactorAuthenticationEnforced'
  | 'trashRetentionDays'
  | 'routerModel'
> & {
  defaultRole?: Omit<Role, 'workspaceMembers' | 'agents' | 'apiKeys'> | null;
};

export const currentWorkspaceState = createState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
