import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const contextStoreFilterGroupsComponentState = createComponentState<
  RecordFilterGroup[]
>({
  key: 'contextStoreFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
