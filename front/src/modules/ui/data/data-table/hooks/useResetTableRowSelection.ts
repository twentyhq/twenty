import { useRecoilCallback } from 'recoil';

import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { tableRowIdsState } from '../states/tableRowIdsState';

export const useResetTableRowSelection = () =>
  useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const tableRowIds = snapshot
          .getLoadable(tableRowIdsState)
          .valueOrThrow();

        for (const rowId of tableRowIds) {
          set(isRowSelectedFamilyState(rowId), false);
        }
      },
    [],
  );
