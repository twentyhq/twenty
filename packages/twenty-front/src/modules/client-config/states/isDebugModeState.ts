import { atom } from 'recoil';

export const isDebugModeState = atom<boolean>({
  key: 'isDebugModeState',
  default: false,
});
