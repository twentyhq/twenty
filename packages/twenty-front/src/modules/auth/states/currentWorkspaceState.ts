import { createState } from 'twenty-ui';

import { Workspace } from '~/generated/graphql';

export type CurrentWorkspace = Pick<
  Workspace,
  | 'id'
  | 'inviteHash'
  | 'logo'
  | 'displayName'
  | 'allowImpersonation'
  | 'featureFlags'
  | 'subscriptionStatus'
  | 'activationStatus'
  | 'currentBillingSubscription'
  | 'currentCacheVersion'
  | 'state'
>;

export const currentWorkspaceState = createState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
});
