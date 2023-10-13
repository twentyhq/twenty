import { useRecoilCallback } from 'recoil';

import { tableRowIdsState } from '../states/tableRowIdsState';

export const useUpsertTableRowId = () =>
  useRecoilCallback(
    ({ set, snapshot }) =>
      (rowId: string) => {
        const currentRowIds = snapshot
          .getLoadable(tableRowIdsState)
          .valueOrThrow();

        set(tableRowIdsState, Array.from(new Set([rowId, ...currentRowIds])));
      },
    [],
  );
