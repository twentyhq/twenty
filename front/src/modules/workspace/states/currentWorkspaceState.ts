import { atom } from 'recoil';

import { GetCurrentWorkspaceQuery } from '~/generated/graphql';

export type CurrentWorskpace = GetCurrentWorkspaceQuery['currentWorkspace'];

export const currentWorkspaceState = atom<CurrentWorskpace | null>({
  key: 'currentWorskpaceState',
  default: null,
});
