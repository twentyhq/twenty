import { useRecoilCallback } from 'recoil';

import { tableRowIdsState } from '../states/tableRowIdsState';

export function useSetTableRowIds() {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      (rowIds: string[]) => {
        const currentRowIds = snapshot
          .getLoadable(tableRowIdsState)
          .valueOrThrow();

        if (JSON.stringify(rowIds) !== JSON.stringify(currentRowIds)) {
          set(tableRowIdsState, rowIds);
        }
      },
    [],
  );
}
