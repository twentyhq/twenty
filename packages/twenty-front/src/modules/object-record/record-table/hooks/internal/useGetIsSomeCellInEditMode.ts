import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useGetIsSomeCellInEditMode = (recordTableScopeId: string) => {
  const {
    currentTableCellInEditModePositionState,
    isTableCellInEditModeFamilyState,
  } = useRecordTableStates(recordTableScopeId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );

        const isSomeCellInEditMode = isTableCellInEditModeFamilyState(
          currentTableCellInEditModePosition,
        );

        return isSomeCellInEditMode;
      },
    [currentTableCellInEditModePositionState, isTableCellInEditModeFamilyState],
  );
};
