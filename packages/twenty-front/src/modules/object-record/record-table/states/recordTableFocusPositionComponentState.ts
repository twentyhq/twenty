import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordTableFocusPositionComponentState =
  createAtomComponentState<TableCellPosition | null>({
    key: 'recordTableFocusPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
