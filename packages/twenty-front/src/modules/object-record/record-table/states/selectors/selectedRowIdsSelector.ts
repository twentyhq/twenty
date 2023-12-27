import { selector } from 'recoil';

import { isRowSelectedFamilyState } from '../../record-table-row/states/isRowSelectedFamilyState';
import { tableRowIdsScopedState } from '../tableRowIdsScopedState';

export const selectedRowIdsSelector = selector<string[]>({
  key: 'selectedRowIdsSelector',
  get: ({ get }) => {
    const rowIds = get(tableRowIdsScopedState);

    return rowIds.filter(
      (rowId) => get(isRowSelectedFamilyState(rowId)) === true,
    );
  },
});
