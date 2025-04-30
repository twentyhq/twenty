import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useRecordTableMoveFocusedRow } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedRow';
import { isRecordTableFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableFocusActiveComponentState';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useRecordTableMove = (recordTableId?: string) => {
  const { moveFocusedRow } = useRecordTableMoveFocusedRow(recordTableId);

  const { moveFocus } = useRecordTableMoveFocusedCell(recordTableId);

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
          moveFocus(direction);
        } else {
          moveFocusedRow(direction);
        }
      },
    [isRecordTableFocusActiveState, moveFocusedRow, moveFocus],
  );

  return {
    move,
  };
};
