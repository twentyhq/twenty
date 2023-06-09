import { atom } from 'recoil';

export const isSomeInputInEditModeState = atom<boolean>({
  key: 'isSomeInputInEditModeState',
  default: false,
});
