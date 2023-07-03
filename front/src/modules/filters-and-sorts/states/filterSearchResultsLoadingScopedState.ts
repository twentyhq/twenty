import { atomFamily } from 'recoil';

export const filterSearchResultsLoadingScopedState = atomFamily<
  boolean,
  string
>({
  key: 'filterSearchResultsLoadingScopedState',
  default: false,
});
