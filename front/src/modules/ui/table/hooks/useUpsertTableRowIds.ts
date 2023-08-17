import { useRecoilCallback } from 'recoil';

import { tableRowIdsState } from '../states/tableRowIdsState';

export function useUpsertTableRowIds() {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      (rowIds: string[]) => {
        const currentRowIds = snapshot
          .getLoadable(tableRowIdsState)
          .valueOrThrow();

        const uniqueRowIds = Array.from(new Set([...rowIds, ...currentRowIds]));
        set(tableRowIdsState, uniqueRowIds);
      },
    [],
  );
}
