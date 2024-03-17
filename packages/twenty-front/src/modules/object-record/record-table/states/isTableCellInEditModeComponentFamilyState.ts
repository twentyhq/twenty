import { createComponentFamilyState } from 'twenty-ui';

import { TableCellPosition } from '../types/TableCellPosition';

export const isTableCellInEditModeComponentFamilyState =
  createComponentFamilyState<boolean, TableCellPosition>({
    key: 'isTableCellInEditModeComponentFamilyState',
    defaultValue: false,
  });
