import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const recordTableCellEditModePositionComponentState =
  createComponentState<TableCellPosition | null>({
    key: 'recordTableCellEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
