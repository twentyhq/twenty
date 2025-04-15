import { useRecoilCallback } from 'recoil';

import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isFocusOnTableCellComponentFamilyState';
import { isFocusUsingMouseState } from '@/object-record/record-table/states/isFocusUsingMouseState';
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

  const isFocusOnTableCellFamilyState = useRecoilComponentCallbackStateV2(
    isFocusOnTableCellComponentFamilyState,
    recordTableId,
  );

  const isTableCellInEditModeFamilyState = useRecoilComponentCallbackStateV2(
    isTableCellInEditModeComponentFamilyState,
    recordTableId,
  );

  const handleContainerMouseEnter = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ cellPosition }: HandleContainerMouseEnterArgs) => {
        const isFocusOnTableCell = getSnapshotValue(
          snapshot,
          isFocusOnTableCellFamilyState(cellPosition),
        );

        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );

        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        );

        if (!isSomeCellInEditMode && !isFocusOnTableCell) {
          moveFocusToCurrentCell(cellPosition);
          set(isFocusUsingMouseState, true);
        }
      },
    [
      isFocusOnTableCellFamilyState,
      currentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
      moveFocusToCurrentCell,
    ],
  );

  return {
    handleContainerMouseEnter,
  };
};
