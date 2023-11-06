import { atomFamily } from 'recoil';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export const tableFiltersScopedState = atomFamily<Filter[], string>({
  key: 'tableFiltersScopedState',
  default: [],
});
