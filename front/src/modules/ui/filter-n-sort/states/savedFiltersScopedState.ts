import { atomFamily } from 'recoil';

import type { Filter } from '../types/Filter';

export const savedFiltersScopedState = atomFamily<Filter[], string | undefined>(
  {
    key: 'savedFiltersScopedState',
    default: [],
  },
);
