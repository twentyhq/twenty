import { createComponentFamilyState } from 'twenty-ui';

import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellComponentFamilyState =
  createComponentFamilyState<boolean, TableCellPosition>({
    key: 'isSoftFocusOnTableCellComponentFamilyState',
    defaultValue: false,
  });
