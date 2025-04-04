import { Role, Workspace } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

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
  | 'hasValidEnterpriseKey'
  | 'isCustomDomainEnabled'
  | 'subdomain'
  | 'customDomain'
  | 'workspaceUrls'
  | 'metadataVersion'
  | 'creatorEmail'
> & {
  defaultRole?: Omit<Role, 'workspaceMembers'> | null;
};

export const currentWorkspaceState = createState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
