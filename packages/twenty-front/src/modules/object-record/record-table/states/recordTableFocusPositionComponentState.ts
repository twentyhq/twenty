import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type TableCellPosition } from '../types/TableCellPosition';

export const recordTableFocusPositionComponentState =
  createComponentState<TableCellPosition | null>({
    key: 'recordTableFocusPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
