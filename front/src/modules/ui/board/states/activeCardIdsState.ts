import { atom } from 'recoil';

export const activeCardIdsState = atom<string[]>({
  key: 'activeCardIdsState',
  default: [],
});
