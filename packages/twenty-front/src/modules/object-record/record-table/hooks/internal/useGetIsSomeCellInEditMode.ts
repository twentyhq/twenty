import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useGetIsSomeCellInEditModeState = (recordTableId?: string) => {
  const currentTableCellInEditModePositionState =
    useRecoilComponentCallbackStateV2(
      currentTableCellInEditModePositionComponentState,
      recordTableId,
    );
  const isTableCellInEditModeFamilyState = useRecoilComponentCallbackStateV2(
    isTableCellInEditModeComponentFamilyState,
    recordTableId,
  );

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
