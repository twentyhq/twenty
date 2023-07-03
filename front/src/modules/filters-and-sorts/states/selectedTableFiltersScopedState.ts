import { atomFamily } from 'recoil';

import { SelectedEntityFilter } from '@/filters-and-sorts/types/SelectedEntityFilter';

export const selectedTableFiltersScopedState = atomFamily<
  SelectedEntityFilter[],
  string
>({
  key: 'selectedTableFiltersScopedState',
  default: [],
});
