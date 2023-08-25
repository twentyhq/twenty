import { atomFamily } from 'recoil';

import type { SelectedSortType } from '../types/interface';

export const sortsScopedState = atomFamily<SelectedSortType<any>[], string>({
  key: 'sortsScopedState',
  default: [],
});
