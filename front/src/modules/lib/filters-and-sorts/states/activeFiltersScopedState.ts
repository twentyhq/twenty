import { atomFamily } from 'recoil';

import { ActiveFilter } from '@/lib/filters-and-sorts/types/ActiveFilter';

export const activeFiltersScopedState = atomFamily<ActiveFilter[], string>({
  key: 'activeFiltersScopedState',
  default: [],
});
