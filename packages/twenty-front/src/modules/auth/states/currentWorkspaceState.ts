import { atom } from 'recoil';

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
>;

export const currentWorkspaceState = atom<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  default: null,
});
