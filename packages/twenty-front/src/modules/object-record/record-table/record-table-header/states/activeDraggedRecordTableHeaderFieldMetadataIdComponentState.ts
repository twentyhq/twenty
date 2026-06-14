import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const activeDraggedRecordTableHeaderFieldMetadataIdComponentState =
  createAtomComponentState<string | null>({
    key: 'activeDraggedRecordTableHeaderFieldMetadataIdComponentState',
    defaultValue: null,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
