import { atom } from 'recoil';

export const isMockModeState = atom({
  key: 'isMockModeState',
  default: false,
});
