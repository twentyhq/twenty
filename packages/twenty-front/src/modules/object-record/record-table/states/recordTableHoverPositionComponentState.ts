import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { TableCellPosition } from '../types/TableCellPosition';

export const recordTableHoverPositionComponentState =
  createComponentState<TableCellPosition | null>({
    key: 'recordTableHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
