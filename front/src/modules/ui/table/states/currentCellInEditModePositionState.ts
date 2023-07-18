import { atom } from 'recoil';

import { CellPosition } from '../types/CellPosition';

export const currentCellInEditModePositionState = atom<CellPosition>({
  key: 'currentCellInEditModePositionState',
  default: {
    row: 0,
    column: 1,
  },
});
