import { atomFamily } from 'recoil';

import { Sort } from '../../object-sort-dropdown/types/Sort';

export const tableSortsScopedState = atomFamily<Sort[], string>({
  key: 'tableSortsScopedState',
  default: [],
});
