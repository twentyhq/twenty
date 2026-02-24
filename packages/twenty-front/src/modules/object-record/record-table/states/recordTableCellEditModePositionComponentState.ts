import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordTableCellEditModePositionComponentState =
  createComponentStateV2<TableCellPosition | null>({
    key: 'recordTableCellEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
