import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { TableCellPosition } from '../types/TableCellPosition';

export const softFocusPositionScopedState =
  createScopedState<TableCellPosition>({
    key: 'softFocusPositionScopedState',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
