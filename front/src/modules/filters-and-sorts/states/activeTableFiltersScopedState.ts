import { atomFamily } from 'recoil';

import { ActiveTableFilter } from '@/filters-and-sorts/types/ActiveTableFilter';

export const activeTableFiltersScopedState = atomFamily<
  ActiveTableFilter[],
  string
>({
  key: 'activeTableFiltersScopedState',
  default: [],
});
