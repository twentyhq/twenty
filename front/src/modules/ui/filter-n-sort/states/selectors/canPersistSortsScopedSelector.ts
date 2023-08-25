import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { savedSortsScopedState } from '../savedSortsScopedState';
import { sortsScopedState } from '../sortsScopedState';

export const canPersistSortsScopedSelector = selectorFamily({
  key: 'canPersistSortsScopedSelector',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedSortsScopedState(viewId)),
        get(sortsScopedState(scopeId)),
      ),
});
