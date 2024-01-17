import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useGetIsSomeCellInEditModeState = (recordTableId?: string) => {
  const {
    getCurrentTableCellInEditModePositionState,
    isTableCellInEditModeFamilyState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          getCurrentTableCellInEditModePositionState(),
        );

        const isSomeCellInEditModeState = isTableCellInEditModeFamilyState(
          currentTableCellInEditModePosition,
        );

        return isSomeCellInEditModeState;
      },
    [
      getCurrentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
    ],
  );
};
