import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordTableFocusPositionComponentState =
  createComponentState<TableCellPosition | null>({
    key: 'recordTableFocusPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
