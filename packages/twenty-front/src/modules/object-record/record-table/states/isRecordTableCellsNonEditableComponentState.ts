import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isRecordTableCellsNonEditableComponentState =
  createAtomComponentState<boolean>({
    key: 'isRecordTableCellsNonEditableComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
