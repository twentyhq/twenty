import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const currentTableCellInEditModePositionScopedState =
  createStateScopeMap<TableCellPosition>({
    key: 'currentTableCellInEditModePositionScopedState',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
