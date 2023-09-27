import { atomFamily } from 'recoil';

import { TableCellPosition } from '../types/TableCellPosition';

export const isTableCellInEditModeFamilyState = atomFamily<
  boolean,
  TableCellPosition
>({
  key: 'isTableCellInEditModeFamilyState',
  default: false,
});
