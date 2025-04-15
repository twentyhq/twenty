import { useRecoilCallback } from 'recoil';

import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export type HandleContainerMouseEnterArgs = {
  cellPosition: TableCellPosition;
};

export const useHandleContainerMouseEnter = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { moveFocusToCurrentCell } = useMoveHoverToCurrentCell(recordTableId);

  const currentTableCellInEditModePositionState =
    useRecoilComponentCallbackStateV2(
      currentTableCellInEditModePositionComponentState,
      recordTableId,
    );

  const isTableCellInEditModeFamilyState = useRecoilComponentCallbackStateV2(
    isTableCellInEditModeComponentFamilyState,
    recordTableId,
  );

  const handleContainerMouseEnter = useRecoilCallback(
    ({ snapshot }) =>
      ({ cellPosition }: HandleContainerMouseEnterArgs) => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );

        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        );

        if (!isSomeCellInEditMode) {
          moveFocusToCurrentCell(cellPosition);
        }
      },
    [
      currentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
      moveFocusToCurrentCell,
    ],
  );

  return {
    handleContainerMouseEnter,
  };
};
