import { selectorFamily } from 'recoil';

import { availableTableColumnsScopedState } from '../availableTableColumnsScopedState';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const hiddenTableColumnsScopedSelector = selectorFamily({
  key: 'hiddenTableColumnsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => {
      const columns = get(tableColumnsScopedState(scopeId));
      const columnKeys = columns.map(({ key }) => key);
      const otherAvailableColumns = get(
        availableTableColumnsScopedState(scopeId),
      ).filter(({ key }) => !columnKeys.includes(key));

      return [
        ...columns.filter((column) => !column.isVisible),
        ...otherAvailableColumns,
      ];
    },
});
