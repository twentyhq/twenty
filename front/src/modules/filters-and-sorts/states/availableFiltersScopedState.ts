import { atomFamily } from 'recoil';

import { EntityFilter } from '../types/EntityFilter';

export const availableFiltersScopedState = atomFamily<EntityFilter[], string>({
  key: 'availableFiltersScopedState',
  default: [],
});
