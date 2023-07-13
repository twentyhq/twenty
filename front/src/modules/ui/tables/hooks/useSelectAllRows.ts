import { useRecoilCallback, useRecoilValue } from 'recoil';

import { allRowsSelectedStatusSelector } from '../states/allRowsSelectedStatusSelector';
import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { numberOfSelectedRowState } from '../states/numberOfSelectedRowState';
import { numberOfTableRowsSelectorState } from '../states/numberOfTableRowsSelectorState';
import { tableRowIdsState } from '../states/tableRowIdsState';

export function useSelectAllRows() {
  const allRowsSelectedStatus = useRecoilValue(allRowsSelectedStatusSelector);

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = snapshot
          .getLoadable(allRowsSelectedStatusSelector)
          .valueOrThrow();

        const numberOfRows = snapshot
          .getLoadable(numberOfTableRowsSelectorState)
          .valueOrThrow();

        const tableRowIds = snapshot
          .getLoadable(tableRowIdsState)
          .valueOrThrow();

        console.log({ allRowsSelectedStatus, numberOfRows, tableRowIds });

        if (allRowsSelectedStatus === 'none') {
          set(numberOfSelectedRowState, numberOfRows);

          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), true);
          }
        } else {
          set(numberOfSelectedRowState, 0);

          for (const rowId of tableRowIds) {
            set(isRowSelectedFamilyState(rowId), false);
          }
        }
      },
    [],
  );

  return {
    allRowsSelectedStatus,
    selectAllRows,
  };
}
