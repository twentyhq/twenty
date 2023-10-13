import { atom } from 'recoil';

import { BoardColumnDefinition } from '@/ui/Layout/Board/types/BoardColumnDefinition';

export const boardColumnsState = atom<BoardColumnDefinition[]>({
  key: 'boardColumnsState',
  default: [],
});
