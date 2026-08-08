import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Bound per record table for the same reason as the last virtualized view id
export const lastContextStoreVirtualizedVisibleRecordFieldsComponentState =
  createAtomComponentState<RecordField[] | null>({
    key: 'lastContextStoreVirtualizedVisibleRecordFieldsComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
