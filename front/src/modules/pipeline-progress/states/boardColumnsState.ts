import { atom } from 'recoil';

import { Column } from '@/ui/board/components/Board';

export const boardColumnsState = atom<Column[]>({
  key: 'boardColumnsState',
  default: [],
});
