import { atom } from 'recoil';

import { BoardColumnDefinition } from '@/ui/object/record-board/types/BoardColumnDefinition';

export const boardColumnsState = atom<BoardColumnDefinition[]>({
  key: 'boardColumnsState',
  default: [],
});
