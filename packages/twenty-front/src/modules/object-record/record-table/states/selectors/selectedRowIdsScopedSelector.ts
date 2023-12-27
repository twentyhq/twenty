import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { isRowSelectedFamilyState } from '../../record-table-row/states/isRowSelectedFamilyState';
import { tableRowIdsScopedState } from '../tableRowIdsScopedState';

export const selectedRowIdsScopedSelector = createScopedSelector<string[]>({
  key: 'selectedRowIdsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const rowIds = get(tableRowIdsScopedState({ scopeId }));

      return rowIds.filter(
        (rowId) => get(isRowSelectedFamilyState(rowId)) === true,
      );
    },
});
