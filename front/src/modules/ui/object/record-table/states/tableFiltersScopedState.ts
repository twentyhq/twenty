import { atomFamily } from 'recoil';

import { Filter } from '../../filter/types/Filter';

export const tableFiltersScopedState = atomFamily<Filter[], string>({
  key: 'tableFiltersScopedState',
  default: [],
});
