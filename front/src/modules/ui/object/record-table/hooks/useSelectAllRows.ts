import { useRecoilCallback, useRecoilValue } from 'recoil';

import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { allRowsSelectedStatusSelector } from '../states/selectors/allRowsSelectedStatusSelector';
import { tableRowIdsState } from '../states/tableRowIdsState';

export const useSelectAllRows = () => {
  const allRowsSelectedStatus = useRecoilValue(allRowsSelectedStatusSelector);

  const selectAllRows = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allRowsSelectedStatus = snapshot
          .getLoadable(allRowsSelectedStatusSelector)
          .valueOrThrow();

        const tableRowIds = snapshot
          .getLoadable(tableRowIdsState)
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
    allRowsSelectedStatus,
    selectAllRows,
  };
};
