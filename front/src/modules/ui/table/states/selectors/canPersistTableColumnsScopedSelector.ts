import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { savedTableColumnsScopedState } from '../savedTableColumnsScopedState';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const canPersistTableColumnsScopedSelector = selectorFamily({
  key: 'canPersistTableColumnsScopedSelector',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedTableColumnsScopedState(viewId)),
        get(tableColumnsScopedState(scopeId)),
      ),
});
