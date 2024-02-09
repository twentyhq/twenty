import { selector } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

export const isCurrentWorkspaceActiveSelector = selector({
  key: 'isCurrentWorkspaceActiveSelector',
  get: ({ get }) => {
    const currentWorkspaceMember = get(currentWorkspaceMemberState);
    return !!currentWorkspaceMember;
  },
});
