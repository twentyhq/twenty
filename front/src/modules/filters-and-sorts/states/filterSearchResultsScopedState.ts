import { atomFamily } from 'recoil';

import { FilterSearchResult } from '../types/FilterSearchResult';

export const filterSearchResultsScopedState = atomFamily<
  FilterSearchResult[],
  string
>({
  key: 'filterSearchResultsScopedState',
  default: [],
});
