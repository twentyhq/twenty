import { atom } from 'recoil';

export const isSoftFocusActiveState = atom<boolean>({
  key: 'isSoftFocusActiveState',
  default: false,
});
