import { atom } from 'recoil';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';

export const recordIndexFiltersState = atom<Filter[]>({
  key: 'recordIndexFiltersState',
  default: [],
});
