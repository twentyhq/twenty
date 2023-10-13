import { atom } from 'recoil';

import { BoardColumnDefinition } from '@/ui/layout/board/types/BoardColumnDefinition';

export const boardColumnsState = atom<BoardColumnDefinition[]>({
  key: 'boardColumnsState',
  default: [],
});
