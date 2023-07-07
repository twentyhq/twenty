import { atom } from 'recoil';

export const isDemoModeState = atom<boolean>({
  key: 'isDemoModeState',
  default: false,
});
