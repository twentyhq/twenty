import { useRecoilCallback } from 'recoil';

import { useMoveSoftFocusToCellOnHoverV2 } from '@/object-record/record-table/record-table-cell/hooks/useMoveSoftFocusToCellOnHoverV2';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export type HandleContainerMouseEnterArgs = {
  cellPosition: TableCellPosition;
};

export const useHandleContainerMouseEnter = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const tableScopeId = getScopeIdFromComponentId(recordTableId);

  const { moveSoftFocusToCell } =
    useMoveSoftFocusToCellOnHoverV2(recordTableId);

  const handleContainerMouseEnter = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ cellPosition }: HandleContainerMouseEnterArgs) => {
        const currentTableCellInEditModePositionState = extractComponentState(
          currentTableCellInEditModePositionComponentState,
          tableScopeId,
        );

        const isSoftFocusOnTableCellFamilyState = extractComponentFamilyState(
          isSoftFocusOnTableCellComponentFamilyState,
          tableScopeId,
        );

        const isSoftFocusOnTableCell = getSnapshotValue(
          snapshot,
          isSoftFocusOnTableCellFamilyState(cellPosition),
        );

        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );

        const isTableCellInEditModeFamilyState = extractComponentFamilyState(
          isTableCellInEditModeComponentFamilyState,
          tableScopeId,
        );

        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        );

        if (!isSomeCellInEditMode && !isSoftFocusOnTableCell) {
          moveSoftFocusToCell(cellPosition);
          set(isSoftFocusUsingMouseState, true);
        }
      },
    [tableScopeId, moveSoftFocusToCell],
  );

  return {
    handleContainerMouseEnter,
  };
};
