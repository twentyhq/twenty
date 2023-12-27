import { useRecoilCallback } from 'recoil';

import { isRowSelectedFamilyState } from '../../record-table-row/states/isRowSelectedFamilyState';
import { allRowsSelectedStatusScopedSelector } from '../../states/selectors/allRowsSelectedStatusScopedSelector';
import { tableRowIdsScopedState } from '../../states/tableRowIdsScopedState';

export const useSelectAllRows = () => {
  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = snapshot
          .getLoadable(allRowsSelectedStatusScopedSelector)
          .valueOrThrow();

        const tableRowIds = snapshot
          .getLoadable(tableRowIdsScopedState)
          .valueOrThrow();

        if (
          allRowsSelectedStatus === 'none' ||
          allRowsSelectedStatus === 'some'
        ) {
          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), true);
          }
        } else {
          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), false);
          }
        }
      },
    [],
  );

  return {
    selectAllRows,
  };
};
