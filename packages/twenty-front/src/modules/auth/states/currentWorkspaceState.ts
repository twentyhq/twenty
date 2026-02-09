import { createState } from 'twenty-ui/utilities';
import {
  type Application,
  type Role,
  type Workspace,
} from '~/generated/graphql';

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
  | 'billingEntitlements'
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
  | 'eventLogRetentionDays'
  | 'fastModel'
  | 'smartModel'
  | 'aiAdditionalInstructions'
  | 'editableProfileFields'
> & {
  defaultRole?: Omit<Role, 'workspaceMembers' | 'agents' | 'apiKeys'> | null;
  workspaceCustomApplication: Pick<Application, 'id'> | null;
};

export const currentWorkspaceState = createState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
