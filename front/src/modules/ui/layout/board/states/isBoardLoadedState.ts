import { atom } from 'recoil';

export const isBoardLoadedState = atom<boolean>({
  key: 'isBoardLoadedState',
  default: false,
});
