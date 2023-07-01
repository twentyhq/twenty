import { atom } from 'recoil';

import { Column } from '@/ui/components/board/Board';

export const boardColumnsState = atom<Column[]>({
  key: 'boardColumnsState',
  default: [],
});
