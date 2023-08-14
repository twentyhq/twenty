import { atom } from 'recoil';

export const contextMenuOpenState = atom<boolean>({
  key: 'contextMenuOpenState',
  default: false,
});
