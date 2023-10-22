import { atomFamily } from 'recoil';

import { Sort } from '../types/Sort';

export const savedSortsFamilyState = atomFamily<Sort[], string | undefined>({
  key: 'savedSortsFamilyState',
  default: [],
});
