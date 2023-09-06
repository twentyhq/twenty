import { atomFamily } from 'recoil';

import type { SelectedSortType } from '../types/interface';

export const savedSortsFamilyState = atomFamily<
  SelectedSortType<any>[],
  string | undefined
>({
  key: 'savedSortsFamilyState',
  default: [],
});
