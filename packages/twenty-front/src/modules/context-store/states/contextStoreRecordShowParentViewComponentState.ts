import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

type RecordShowParentViewComponentState = {
  parentViewComponentId: string;
  parentViewObjectNameSingular: string;
  parentViewFilterGroups: RecordFilterGroup[];
  parentViewFilters: RecordFilter[];
  parentViewSorts: RecordSort[];
};

export const contextStoreRecordShowParentViewComponentState =
  createComponentState<RecordShowParentViewComponentState | undefined | null>({
    key: 'contextStoreRecordShowParentViewComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
