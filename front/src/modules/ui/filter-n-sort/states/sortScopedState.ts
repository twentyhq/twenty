import { atomFamily, selectorFamily } from 'recoil';

import { reduceSortsToOrderBy } from '../helpers';
import { SelectedSortType } from '../types/interface';

export const sortScopedState = atomFamily<SelectedSortType<any>[], string>({
  key: 'sortScopedState',
  default: [],
});

export const sortsByKeyScopedState = selectorFamily({
  key: 'sortsByKeyScopedState',
  get:
    (param: string) =>
    ({ get }) =>
      get(sortScopedState(param)).reduce<Record<string, SelectedSortType<any>>>(
        (result, sort) => ({ ...result, [sort.key]: sort }),
        {},
      ),
});

export const sortsOrderByScopedState = selectorFamily({
  key: 'sortsOrderByScopedState',
  get:
    (param: string) =>
    ({ get }) =>
      reduceSortsToOrderBy(get(sortScopedState(param))),
});
