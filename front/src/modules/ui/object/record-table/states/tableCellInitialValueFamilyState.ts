import { atomFamily } from 'recoil';

import { TableCellInitialValue } from '../types/TableCellInitialValue';
import { TableCellPosition } from '../types/TableCellPosition';

export const tableCellInitialValueFamilyState = atomFamily<
  TableCellInitialValue | undefined,
  TableCellPosition
>({
  key: 'tableCellInitialValueFamilyState',
  default: undefined,
});
