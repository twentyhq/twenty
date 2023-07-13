import { atomFamily } from 'recoil';

import { Filter } from '@/lib/filters-and-sorts/types/Filter';

export const filtersScopedState = atomFamily<Filter[], string>({
  key: 'filtersScopedState',
  default: [],
});
