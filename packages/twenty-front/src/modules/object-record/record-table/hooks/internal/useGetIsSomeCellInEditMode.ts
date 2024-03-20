import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useGetIsSomeCellInEditModeState = (recordTableId?: string) => {
  const {
    currentTableCellInEditModePositionState,
    isTableCellInEditModeFamilyState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );

        const isSomeCellInEditModeState = isTableCellInEditModeFamilyState(
          currentTableCellInEditModePosition,
        );

        return isSomeCellInEditModeState;
      },
    [currentTableCellInEditModePositionState, isTableCellInEditModeFamilyState],
  );
};
