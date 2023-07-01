import { atom } from 'recoil';

export const selectedBoardItemsState = atom<string[]>({
  key: 'selectedBoardItemsState',
  default: [],
});
