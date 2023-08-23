import { selectorFamily } from 'recoil';

import type { Filter } from '../types/Filter';

import { savedFiltersScopedState } from './savedFiltersScopedState';

export const savedFiltersByKeyScopedSelector = selectorFamily({
  key: 'savedFiltersByKeyScopedSelector',
  get:
    (param: string | undefined) =>
    ({ get }) =>
      get(savedFiltersScopedState(param)).reduce<Record<string, Filter>>(
        (result, filter) => ({ ...result, [filter.key]: filter }),
        {},
      ),
});
