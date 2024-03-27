import { createComponentState } from 'twenty-ui';

import { TableCellPosition } from '../types/TableCellPosition';

export const currentTableCellInEditModePositionComponentState =
  createComponentState<TableCellPosition>({
    key: 'currentTableCellInEditModePositionComponentState',
    defaultValue: {
      row: 0,
      column: 1,
    },
  });
