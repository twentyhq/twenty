import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export const tableFiltersScopedState = createScopedState<Filter[]>({
  key: 'tableFiltersScopedState',
  defaultValue: [],
});
