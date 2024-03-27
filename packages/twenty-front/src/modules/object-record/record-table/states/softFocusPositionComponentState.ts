import { createComponentState } from 'twenty-ui';

import { TableCellPosition } from '../types/TableCellPosition';

export const softFocusPositionComponentState =
  createComponentState<TableCellPosition>({
    key: 'softFocusPositionComponentState',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
