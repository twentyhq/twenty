import { atomFamily } from 'recoil';

import { SelectedEntityFilter } from '@/filters-and-sorts/types/SelectedEntityFilter';

export const selectedFiltersScopedState = atomFamily<
  SelectedEntityFilter[],
  string
>({
  key: 'selectedFiltersScopedState',
  default: [],
});
