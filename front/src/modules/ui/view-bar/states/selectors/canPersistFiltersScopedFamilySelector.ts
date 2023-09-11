import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { filtersScopedState } from '../filtersScopedState';
import { savedFiltersFamilyState } from '../savedFiltersFamilyState';

export const canPersistFiltersScopedFamilySelector = selectorFamily({
  key: 'canPersistFiltersScopedFamilySelector',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedFiltersFamilyState(viewId)),
        get(filtersScopedState(scopeId)),
      ),
});
