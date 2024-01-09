import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const softFocusPositionScopedState =
  createStateScopeMap<TableCellPosition>({
    key: 'softFocusPositionScopedState',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
