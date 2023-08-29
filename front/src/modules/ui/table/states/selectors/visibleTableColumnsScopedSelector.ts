import { selectorFamily } from 'recoil';

import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const visibleTableColumnsScopedSelector = selectorFamily({
  key: 'visibleTableColumnsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState(scopeId)).filter(
        (column) => column.isVisible,
      ),
});
