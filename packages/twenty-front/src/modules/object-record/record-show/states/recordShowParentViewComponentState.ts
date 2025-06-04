import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordShowComponentInstanceContext } from '@/object-record/record-show/states/contexts/RecordShowComponentInstanceContext';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

type RecordShowParentViewComponentState = {
  parentViewComponentId: string;
  parentViewFilters: RecordFilter[];
  parentViewSorts: RecordSort[];
};

export const recordShowParentViewComponentState = createComponentStateV2<
  RecordShowParentViewComponentState | undefined | null
>({
  key: 'recordShowParentViewComponentState',
  defaultValue: undefined,
  componentInstanceContext: RecordShowComponentInstanceContext,
});
