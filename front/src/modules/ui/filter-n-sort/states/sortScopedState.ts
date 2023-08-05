import { atomFamily } from 'recoil';

import { Filter } from '../types/Filter';

export const sortScopedState = atomFamily<Filter[], string>({
  key: 'sortScopedState',
  default: [],
});
