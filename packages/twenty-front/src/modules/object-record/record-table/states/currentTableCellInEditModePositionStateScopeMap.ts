import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const currentTableCellInEditModePositionStateScopeMap =
  createStateScopeMap<TableCellPosition>({
    key: 'currentTableCellInEditModePositionStateScopeMap',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
