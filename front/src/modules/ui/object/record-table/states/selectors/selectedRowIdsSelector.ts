import { selector } from 'recoil';

import { isRowSelectedFamilyState } from '../../record-table-row/states/isRowSelectedFamilyState';
import { tableRowIdsState } from '../tableRowIdsState';

export const selectedRowIdsSelector = selector<string[]>({
  key: 'selectedRowIdsSelector',
  get: ({ get }) => {
    const rowIds = get(tableRowIdsState);

    return rowIds.filter(
      (rowId) => get(isRowSelectedFamilyState(rowId)) === true,
    );
  },
});
