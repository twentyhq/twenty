import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetSoftFocusPosition = (recordTableId?: string) => {
  const {
    softFocusPositionState,
    isSoftFocusActiveState,
    isSoftFocusOnTableCellFamilyState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return (newPosition: TableCellPosition) => {
        const currentPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        set(isSoftFocusActiveState, true);

        set(isSoftFocusOnTableCellFamilyState(currentPosition), false);

        document.dispatchEvent(
          new CustomEvent(
            `soft-focus-move-${currentPosition.row}:${currentPosition.column}`,
            { detail: false },
          ),
        );

        set(softFocusPositionState, newPosition);

        set(isSoftFocusOnTableCellFamilyState(newPosition), true);

        document.dispatchEvent(
          new CustomEvent(
            `soft-focus-move-${newPosition.row}:${newPosition.column}`,
            { detail: true },
          ),
        );
      };
    },
    [
      softFocusPositionState,
      isSoftFocusActiveState,
      isSoftFocusOnTableCellFamilyState,
    ],
  );
};
