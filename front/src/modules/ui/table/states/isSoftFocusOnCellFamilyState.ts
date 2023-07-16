import { atomFamily } from 'recoil';

import { CellPosition } from '../types/CellPosition';

export const isSoftFocusOnCellFamilyState = atomFamily<boolean, CellPosition>({
  key: 'isSoftFocusOnCellFamilyState',
  default: false,
});
