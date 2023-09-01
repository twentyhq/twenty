import { selectorFamily } from 'recoil';

import { availableTableColumnsScopedState } from '../availableTableColumnsScopedState';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const hiddenTableColumnsScopedSelector = selectorFamily({
  key: 'hiddenTableColumnsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => {
      const columns = get(tableColumnsScopedState(scopeId));
      const columnLabels = columns.map(({ label }) => label);
      const otherAvailableColumns = get(
        availableTableColumnsScopedState(scopeId),
      ).filter(({ label }) => !columnLabels.includes(label));

      return [
        ...columns.filter((column) => !column.isVisible),
        ...otherAvailableColumns,
      ];
    },
});
