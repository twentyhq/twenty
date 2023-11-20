import { atom } from 'recoil';

import { Workspace } from '~/generated-metadata/graphql';

export type CurrentWorkspace = Pick<
  Workspace,
  'id' | 'inviteHash' | 'logo' | 'displayName'
>;

export const currentWorkspaceState = atom<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  default: null,
});
