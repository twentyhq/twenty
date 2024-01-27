import { atom } from 'recoil';

import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';

export const recordIndexSortsState = atom<Sort[]>({
  key: 'recordIndexSortsState',
  default: [],
});
