import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

type RecordShowParentViewComponentState = {
  parentViewComponentId: string;
  parentViewObjectNameSingular: string;
  parentViewFilterGroups: RecordFilterGroup[];
  parentViewFilters: RecordFilter[];
  parentViewSorts: RecordSort[];
};

export const contextStoreRecordShowParentViewComponentState =
  createComponentStateV2<RecordShowParentViewComponentState | undefined | null>(
    {
      key: 'contextStoreRecordShowParentViewComponentState',
      defaultValue: undefined,
      componentInstanceContext: ContextStoreComponentInstanceContext,
    },
  );
