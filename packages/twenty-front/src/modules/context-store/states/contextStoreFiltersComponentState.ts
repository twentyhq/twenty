import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreFiltersComponentState = createComponentStateV2<
  RecordFilter[]
>({
  key: 'contextStoreFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
