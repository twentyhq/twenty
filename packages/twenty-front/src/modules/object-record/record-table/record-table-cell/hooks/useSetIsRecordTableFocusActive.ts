import { isRecordTableFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useSetIsRecordTableFocusActive = (recordTableId?: string) => {
  const isRecordTableFocusActiveState = useRecoilComponentCallbackStateV2(
    isRecordTableFocusActiveComponentState,
    recordTableId,
  );

  const focusPositionState = useRecoilComponentCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const setIsFocusActive = useRecoilCallback(
    ({ set }) =>
      (isRecordTableFocusActive: boolean, cellPosition: TableCellPosition) => {
        const cellId = `record-table-cell-${cellPosition.column}-${cellPosition.row}`;

        const cellElement = document.getElementById(cellId);

        if (isRecordTableFocusActive) {
          cellElement?.classList.add('focus-active');
        }

        if (!isRecordTableFocusActive) {
          cellElement?.classList.remove('focus-active');
        }

        set(isRecordTableFocusActiveState, isRecordTableFocusActive);
      },
    [isRecordTableFocusActiveState],
  );

  const setIsFocusActiveForCurrentPosition = useRecoilCallback(
    ({ snapshot }) =>
      (isRecordTableFocusActive: boolean) => {
        const currentPosition = snapshot
          .getLoadable(focusPositionState)
          .getValue();

        setIsFocusActive(isRecordTableFocusActive, currentPosition);
      },
    [setIsFocusActive, focusPositionState],
  );

  return { setIsFocusActive, setIsFocusActiveForCurrentPosition };
};
