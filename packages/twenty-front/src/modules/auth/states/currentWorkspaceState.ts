import { createState } from '@ui/utilities/state/utils/createState';

import { Workspace } from '~/generated/graphql';

export type CurrentWorkspace = Pick<
  Workspace,
  | 'id'
  | 'inviteHash'
  | 'logo'
  | 'displayName'
  | 'allowImpersonation'
  | 'featureFlags'
  | 'activationStatus'
  | 'currentBillingSubscription'
  | 'workspaceMembersCount'
  | 'isPublicInviteLinkEnabled'
  | 'isGoogleAuthEnabled'
  | 'isMicrosoftAuthEnabled'
  | 'isPasswordAuthEnabled'
  | 'hasValidEntrepriseKey'
  | 'subdomain'
  | 'metadataVersion'
>;

export const currentWorkspaceState = createState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
