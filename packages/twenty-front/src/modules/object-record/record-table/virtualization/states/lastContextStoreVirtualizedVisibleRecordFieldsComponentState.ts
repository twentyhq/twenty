import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastContextStoreVirtualizedVisibleRecordFieldsComponentState =
  createAtomComponentState<RecordField[] | null>({
    key: 'lastContextStoreVirtualizedVisibleRecordFieldsComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: null,
  });
