import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { isRowSelectedScopedFamilyState } from '../../record-table-row/states/isRowSelectedScopedFamilyState';
import { tableRowIdsScopedState } from '../tableRowIdsScopedState';

export const selectedRowIdsScopedSelector = createScopedSelector<string[]>({
  key: 'selectedRowIdsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const rowIds = get(tableRowIdsScopedState({ scopeId }));

      return rowIds.filter(
        (rowId) =>
          get(
            isRowSelectedScopedFamilyState({
              scopeId,
              familyKey: rowId,
            }),
          ) === true,
      );
    },
});
