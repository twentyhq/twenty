import { atomFamily } from 'recoil';

import { FilterDefinition } from '../types/FilterDefinition';

export const availableFiltersScopedState = atomFamily<
  FilterDefinition[],
  string
>({
  key: 'availableFiltersScopedState',
  default: [],
});
