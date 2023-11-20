import { useRecoilCallback } from 'recoil';

import { tableRowIdsState } from '../states/tableRowIdsState';

// Used only in company table and people table
// Remove after refactoring

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
