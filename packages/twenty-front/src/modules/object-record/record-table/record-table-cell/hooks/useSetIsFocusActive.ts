import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { isFocusActiveComponentState } from '@/object-record/record-table/states/isFocusActiveComponentState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useSetIsFocusActive = (recordTableId?: string) => {
  const isFocusActiveState = useRecoilComponentCallbackStateV2(
    isFocusActiveComponentState,
    recordTableId,
  );

  const focusPositionState = useRecoilComponentCallbackStateV2(
    focusPositionComponentState,
    recordTableId,
  );

  const setIsFocusActive = useRecoilCallback(
    ({ set }) =>
      (isFocusActive: boolean, cellPosition: TableCellPosition) => {
        const cellId = `record-table-cell-${cellPosition.column}-${cellPosition.row}`;

        const cellElement = document.getElementById(cellId);

        if (isFocusActive) {
          cellElement?.classList.add('focus-active');
        }

        if (!isFocusActive) {
          cellElement?.classList.remove('focus-active');
        }

        set(isFocusActiveState, isFocusActive);
      },
    [isFocusActiveState],
  );

  const setIsFocusActiveForCurrentPosition = useRecoilCallback(
    ({ snapshot }) =>
      (isFocusActive: boolean) => {
        const currentPosition = snapshot
          .getLoadable(focusPositionState)
          .getValue();

        setIsFocusActive(isFocusActive, currentPosition);
      },
    [setIsFocusActive, focusPositionState],
  );

  return { setIsFocusActive, setIsFocusActiveForCurrentPosition };
};
