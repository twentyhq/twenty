import { atomFamily } from 'recoil';

import { Sort } from '../types/Sort';

export const sortsScopedState = atomFamily<Sort[], string>({
  key: 'sortsScopedState',
  default: [],
});
