import { atomFamily } from 'recoil';

import type { SelectedSortType } from '../types/interface';

export const savedSortsScopedState = atomFamily<
  SelectedSortType<any>[],
  string | undefined
>({
  key: 'savedSortsScopedState',
  default: [],
});
