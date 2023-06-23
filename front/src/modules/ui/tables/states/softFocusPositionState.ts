import { atom } from 'recoil';

import { TablePosition } from '../types/TablePosition';

export const softFocusPositionState = atom<TablePosition | null>({
  key: 'softFocusPositionState',
  default: null,
});
