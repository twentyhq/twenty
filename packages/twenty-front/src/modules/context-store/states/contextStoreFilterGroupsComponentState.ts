import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const contextStoreFilterGroupsComponentState = createComponentStateV2<
  RecordFilterGroup[]
>({
  key: 'contextStoreFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: ContextStoreComponentInstanceContext,
});
