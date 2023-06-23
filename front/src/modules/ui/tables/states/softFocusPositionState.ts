import { atom } from 'recoil';

import { TablePosition } from '../types/TablePosition';

export const softFocusPositionState = atom<TablePosition>({
  key: 'softFocusPositionState',
  default: {
    row: 0,
    column: 1,
  },
});
