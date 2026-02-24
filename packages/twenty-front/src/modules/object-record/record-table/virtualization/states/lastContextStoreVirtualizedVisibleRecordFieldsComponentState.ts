import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const lastContextStoreVirtualizedVisibleRecordFieldsComponentState =
  createComponentStateV2<RecordField[] | null>({
    key: 'lastContextStoreVirtualizedVisibleRecordFieldsComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: null,
  });
