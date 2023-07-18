import { atom } from 'recoil';

export const selectedBoardCardsState = atom<string[]>({
  key: 'isBoardCardSelectedFamilyState',
  default: [],
});
