import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const tableFiltersComponentState = createComponentStateV2<Filter[]>({
  key: 'tableFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableScopeInternalContext,
});
