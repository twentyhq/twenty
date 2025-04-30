import { useRecordTableMoveActiveRow } from '@/object-record/record-table/hooks/useRecordTableMoveActiveRow';
import { useRecordTableMoveFocus } from '@/object-record/record-table/hooks/useRecordTableMoveFocus';
import { isRecordTableFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableFocusActiveComponentState';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useRecordTableMove = (recordTableId?: string) => {
  const moveActiveRow = useRecordTableMoveActiveRow(recordTableId);

  const moveFocus = useRecordTableMoveFocus(recordTableId);

  const isRecordTableFocusActiveState = useRecoilComponentCallbackStateV2(
    isRecordTableFocusActiveComponentState,
    recordTableId,
  );

  const move = useRecoilCallback(
    ({ snapshot }) =>
      (direction: MoveFocusDirection) => {
        const isRecordTableFocusActive = getSnapshotValue(
          snapshot,
          isRecordTableFocusActiveState,
        );

        if (isRecordTableFocusActive) {
          moveFocus.moveFocus(direction);
        } else {
          moveActiveRow.moveActiveRow(direction);
        }
      },
    [isRecordTableFocusActiveState, moveActiveRow, moveFocus],
  );

  return {
    move,
  };
};
