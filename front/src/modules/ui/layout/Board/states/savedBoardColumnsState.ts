import { atom } from 'recoil';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const savedBoardColumnsState = atom<BoardColumnDefinition[]>({
  key: 'savedBoardColumnsState',
  default: [],
});
