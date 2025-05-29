import { createState } from 'twenty-ui/utilities';
import { Role, Workspace } from '~/generated/graphql';

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
  | 'isMicrosoftAuthEnabled'
  | 'isPasswordAuthEnabled'
  | 'isCustomDomainEnabled'
  | 'hasValidEnterpriseKey'
  | 'subdomain'
  | 'customDomain'
  | 'workspaceUrls'
  | 'metadataVersion'
> & {
  defaultRole?: Omit<Role, 'workspaceMembers'> | null;
};

export const currentWorkspaceState = createState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
