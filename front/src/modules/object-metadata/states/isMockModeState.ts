import { atom } from 'recoil';

export const isMockModeState = atom<boolean>({
  key: 'isMockModeState',
  default: true,
});
