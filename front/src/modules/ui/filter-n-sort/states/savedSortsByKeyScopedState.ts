import { selectorFamily } from 'recoil';

import type { SelectedSortType } from '../types/interface';

import { savedSortsScopedState } from './savedSortsScopedState';

export const savedSortsByKeyScopedState = selectorFamily({
  key: 'savedSortsByKeyScopedState',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedSortsScopedState(viewId)).reduce<
        Record<string, SelectedSortType<any>>
      >((result, sort) => ({ ...result, [sort.key]: sort }), {}),
});
