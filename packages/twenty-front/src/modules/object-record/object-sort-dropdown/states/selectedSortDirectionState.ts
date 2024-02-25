import { atom } from 'recoil';

import { SortDirection } from '@/object-record/object-sort-dropdown/types/SortDirection';

const selectedSortDirectionState = atom<SortDirection>({
  key: 'selectedSortDirectionState',
  default: 'asc',
});

export default selectedSortDirectionState;
