import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useCloseCurrentTableCellInEditMode = (recordTableId?: string) => {
  const {
    getCurrentTableCellInEditModePositionState,
    isTableCellInEditModeFamilyState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return async () => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          getCurrentTableCellInEditModePositionState(),
        );

        set(
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
          false,
        );
      };
    },
    [
      getCurrentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
    ],
  );
};
