import { atomFamily } from 'recoil';

import type { Filter } from '../types/Filter';

export const savedFiltersFamilyState = atomFamily<Filter[], string | undefined>(
  {
    key: 'savedFiltersFamilyState',
    default: [],
  },
);
