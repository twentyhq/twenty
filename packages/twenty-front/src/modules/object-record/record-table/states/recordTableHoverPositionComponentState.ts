import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const recordTableHoverPositionComponentState =
  createComponentState<TableCellPosition | null>({
    key: 'recordTableHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
