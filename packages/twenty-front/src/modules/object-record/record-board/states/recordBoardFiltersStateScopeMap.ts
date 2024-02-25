import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardFiltersStateScopeMap = createStateScopeMap<Filter[]>({
  key: 'recordBoardFiltersStateScopeMap',
  defaultValue: [],
});
