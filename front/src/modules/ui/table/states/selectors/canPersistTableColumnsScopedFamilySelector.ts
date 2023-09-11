import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { savedTableColumnsFamilyState } from '../savedTableColumnsFamilyState';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const canPersistTableColumnsScopedFamilySelector = selectorFamily({
  key: 'canPersistTableColumnsScopedFamilySelector',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedTableColumnsFamilyState(viewId)),
        get(tableColumnsScopedState(scopeId)),
      ),
});
