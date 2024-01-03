import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { TableCellPosition } from '../types/TableCellPosition';

export const currentTableCellInEditModePositionScopedState =
  createScopedState<TableCellPosition>({
    key: 'currentTableCellInEditModePositionScopedState',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
