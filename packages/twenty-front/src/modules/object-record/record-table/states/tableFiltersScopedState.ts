import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export const tableFiltersScopedState = createStateScopeMap<Filter[]>({
  key: 'tableFiltersScopedState',
  defaultValue: [],
});
