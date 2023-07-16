import { atomFamily } from 'recoil';

import { Filter } from '../types/Filter';

export const filtersScopedState = atomFamily<Filter[], string>({
  key: 'filtersScopedState',
  default: [],
});
