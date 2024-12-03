import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const contextStoreFiltersComponentState = createComponentStateV2<
  Filter[]
>({
  key: 'contextStoreFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
