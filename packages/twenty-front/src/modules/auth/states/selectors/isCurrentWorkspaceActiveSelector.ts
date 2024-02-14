import { selector } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const isCurrentWorkspaceActiveSelector = selector({
  key: 'isCurrentWorkspaceActiveSelector',
  get: ({ get }) => {
    const currentWorkspace = get(currentWorkspaceState);
    return currentWorkspace && currentWorkspace.activationStatus === 'active';
  },
});
