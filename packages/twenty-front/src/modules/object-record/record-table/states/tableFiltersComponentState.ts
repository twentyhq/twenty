import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const tableFiltersComponentState = createComponentStateV2<Filter[]>({
  key: 'tableFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
