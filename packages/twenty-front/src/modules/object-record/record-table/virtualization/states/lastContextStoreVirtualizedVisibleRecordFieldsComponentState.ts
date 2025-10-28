import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const lastContextStoreVirtualizedVisibleRecordFieldsComponentState =
  createComponentState<RecordField[] | null>({
    key: 'lastContextStoreVirtualizedVisibleRecordFieldsComponentState',
    componentInstanceContext: ContextStoreComponentInstanceContext,
    defaultValue: null,
  });
