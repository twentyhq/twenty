import { atomFamily } from 'recoil';

import { SortDefinition } from '../types/SortDefinition';

export const availableSortsScopedState = atomFamily<SortDefinition[], string>({
  key: 'availableSortsScopedState',
  default: [],
});
