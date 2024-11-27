import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { TableCellPosition } from '../types/TableCellPosition';

export const currentTableCellInEditModePositionComponentState =
  createComponentStateV2<TableCellPosition>({
    key: 'currentTableCellInEditModePositionComponentState',
    defaultValue: {
      row: 0,
      column: 1,
    },
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
