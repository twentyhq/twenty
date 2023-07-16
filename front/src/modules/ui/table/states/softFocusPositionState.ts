import { atom } from 'recoil';

import { CellPosition } from '../types/CellPosition';

export const softFocusPositionState = atom<CellPosition>({
  key: 'softFocusPositionState',
  default: {
    row: 0,
    column: 1,
  },
});
