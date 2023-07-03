import { atomFamily } from 'recoil';

import { EntityFilter } from '../types/EntityFilter';

export const availableTableFiltersScopedState = atomFamily<
  EntityFilter[],
  string
>({
  key: 'availableTableFiltersScopedState',
  default: [],
});
