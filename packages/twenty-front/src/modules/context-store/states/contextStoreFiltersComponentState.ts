import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const contextStoreFiltersComponentState = createComponentState<
  RecordFilter[]
>({
  key: 'contextStoreFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
