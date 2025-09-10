import { atom } from 'recoil';

export const workspaceMemberBeingDeletedState = atom<string | undefined>({
  key: 'workspaceMemberBeingDeletedState',
  default: undefined,
});
