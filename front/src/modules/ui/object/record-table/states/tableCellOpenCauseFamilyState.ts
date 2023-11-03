import { atomFamily } from 'recoil';

import { TableCellOpenCause } from '../types/TableCellOpenCause';
import { TableCellPosition } from '../types/TableCellPosition';

export const tableCellOpenCauseFamilyState = atomFamily<
  TableCellOpenCause | undefined,
  TableCellPosition
>({
  key: 'tableCellOpenCauseFamilyState',
  default: undefined,
});
