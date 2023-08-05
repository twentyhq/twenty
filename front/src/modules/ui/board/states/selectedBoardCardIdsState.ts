import { atom } from 'recoil';

export const selectedBoardCardIdsState = atom<string[]>({
  key: 'selectedBoardCardIdsState',
  default: [],
});
