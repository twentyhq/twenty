import { atom } from 'recoil';

import { TableCellPosition } from '../types/TableCellPosition';

export const softFocusPositionState = atom<TableCellPosition>({
  key: 'softFocusPositionState',
  default: {
    row: 0,
    column: 1,
  },
});
