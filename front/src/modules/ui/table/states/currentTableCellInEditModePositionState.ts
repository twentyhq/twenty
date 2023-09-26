import { atom } from 'recoil';

import { TableCellPosition } from '../types/TableCellPosition';

export const currentTableCellInEditModePositionState = atom<TableCellPosition>({
  key: 'currentTableCellInEditModePositionState',
  default: {
    row: 0,
    column: 1,
  },
});
