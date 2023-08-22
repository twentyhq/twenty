import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { filtersScopedState } from './filtersScopedState';
import { savedFiltersScopedState } from './savedFiltersScopedState';

export const canPersistFiltersScopedState = selectorFamily({
  key: 'canPersistFiltersScopedState',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedFiltersScopedState(viewId)),
        get(filtersScopedState(scopeId)),
      ),
});
