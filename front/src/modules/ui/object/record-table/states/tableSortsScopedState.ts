import { atomFamily } from 'recoil';

import { Sort } from '../../sort/types/Sort';

export const tableSortsScopedState = atomFamily<Sort[], string>({
  key: 'tableSortsScopedState',
  default: [],
});
