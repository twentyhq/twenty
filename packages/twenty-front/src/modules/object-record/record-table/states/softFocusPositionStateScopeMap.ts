import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const softFocusPositionStateScopeMap =
  createStateScopeMap<TableCellPosition>({
    key: 'softFocusPositionStateScopeMap',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
