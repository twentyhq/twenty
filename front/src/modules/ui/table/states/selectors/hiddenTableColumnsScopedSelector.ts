import { selectorFamily } from 'recoil';

import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const hiddenTableColumnsScopedSelector = selectorFamily({
  key: 'hiddenTableColumnsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState(scopeId)).filter(
        (column) => !column.isVisible,
      ),
});
