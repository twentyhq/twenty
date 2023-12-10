import { atomFamily } from 'recoil';

import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellFamilyState = atomFamily<
  boolean,
  TableCellPosition
>({
  key: 'isSoftFocusOnTableCellFamilyState',
  default: false,
});
