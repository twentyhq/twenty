import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetIsRecordTableCellFocusActive = (recordTableId?: string) => {
  const isRecordTableFocusActiveState = useRecoilComponentCallbackState(
    isRecordTableCellFocusActiveComponentState,
    recordTableId,
  );

  const setIsRecordTableCellFocusActive = useRecoilCallback(
    ({ set }) =>
      ({
        isRecordTableFocusActive,
        cellPosition,
      }: {
        isRecordTableFocusActive: boolean;
        cellPosition: TableCellPosition;
      }) => {
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

  return {
    setIsRecordTableCellFocusActive,
  };
};
