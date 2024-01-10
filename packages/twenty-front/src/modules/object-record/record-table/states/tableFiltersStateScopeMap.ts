import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export const tableFiltersStateScopeMap = createStateScopeMap<Filter[]>({
  key: 'tableFiltersStateScopeMap',
  defaultValue: [],
});
