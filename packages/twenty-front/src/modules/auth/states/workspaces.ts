import { atom } from 'recoil';

import { Workspace } from '~/generated/graphql';

export type Workspaces = Pick<Workspace, 'id' | 'logo' | 'displayName'>;

export const workspacesState = atom<Workspaces[] | null>({
  key: 'workspacesState',
  default: [],
});
