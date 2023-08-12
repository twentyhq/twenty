import { useRecoilCallback } from 'recoil';

import { tableRowIdsState } from '../states/tableRowIdsState';

export function useUpsertTableRowId() {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      (rowId: string) => {
        const currentRowIds = snapshot
          .getLoadable(tableRowIdsState)
          .valueOrThrow();

        set(tableRowIdsState, Array.from(new Set([...currentRowIds, rowId])));
      },
    [],
  );
}
