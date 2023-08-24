import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { filtersScopedState } from '../filtersScopedState';
import { savedFiltersScopedState } from '../savedFiltersScopedState';

export const canPersistFiltersScopedSelector = selectorFamily({
  key: 'canPersistFiltersScopedSelector',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedFiltersScopedState(viewId)),
        get(filtersScopedState(scopeId)),
      ),
});
