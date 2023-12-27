import { useRecoilCallback } from 'recoil';

import { isRowSelectedFamilyState } from '../../record-table-row/states/isRowSelectedFamilyState';
import { tableRowIdsScopedState } from '../../states/tableRowIdsScopedState';

export const useResetTableRowSelection = () =>
  useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const tableRowIds = snapshot
          .getLoadable(tableRowIdsScopedState)
          .valueOrThrow();

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }
      },
    [],
  );
