import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useSetIsRecordTableCellFocusActive = (recordTableId?: string) => {
  const isRecordTableFocusActiveState = useRecoilComponentCallbackStateV2(
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
