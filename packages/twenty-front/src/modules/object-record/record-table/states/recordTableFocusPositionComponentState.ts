import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const recordTableFocusPositionComponentState =
  createComponentState<TableCellPosition>({
    key: 'recordTableFocusPositionComponentState',
    defaultValue: {
      row: 0,
      column: 1,
    },
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
