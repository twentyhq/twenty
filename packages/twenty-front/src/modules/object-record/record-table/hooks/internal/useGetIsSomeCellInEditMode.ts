import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

export const useGetIsSomeCellInEditMode = (recordTableScopeId: string) => {
  const {
    currentTableCellInEditModePositionScopeInjector,
    isTableCellInEditModeScopeInjector,
  } = getRecordTableScopeInjector();

  const {
    injectSnapshotValueWithRecordTableScopeId,
    injectFamilySnapshotValueWithRecordTableScopeId,
  } = useRecordTableScopedStates(recordTableScopeId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition =
          injectSnapshotValueWithRecordTableScopeId(
            snapshot,
            currentTableCellInEditModePositionScopeInjector,
          );

        const isSomeCellInEditModeFamilyState =
          injectFamilySnapshotValueWithRecordTableScopeId(
            snapshot,
            isTableCellInEditModeScopeInjector,
          );

        const isSomeCellInEditMode = isSomeCellInEditModeFamilyState(
          currentTableCellInEditModePosition,
        );

        return isSomeCellInEditMode;
      },
    [
      currentTableCellInEditModePositionScopeInjector,
      injectFamilySnapshotValueWithRecordTableScopeId,
      injectSnapshotValueWithRecordTableScopeId,
      isTableCellInEditModeScopeInjector,
    ],
  );
};
