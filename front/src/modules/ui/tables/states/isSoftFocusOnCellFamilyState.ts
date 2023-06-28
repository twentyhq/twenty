import { atomFamily } from 'recoil';

import { TablePosition } from '../types/TablePosition';

export const isSoftFocusOnCellFamilyState = atomFamily<boolean, TablePosition>({
  key: 'isSoftFocusOnCellFamilyState',
  default: false,
});
