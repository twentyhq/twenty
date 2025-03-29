import { atom } from 'recoil';

export const multiWorkspaceDropdownState = atom<
  'default' | 'workspaces-list' | 'themes'
>({
  key: 'multiWorkspaceDropdownState',
  default: 'default',
});
