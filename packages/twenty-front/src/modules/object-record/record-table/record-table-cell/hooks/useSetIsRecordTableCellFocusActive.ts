import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetIsRecordTableCellFocusActive = (recordTableId?: string) => {
  const isRecordTableFocusActiveCallbackState = useRecoilComponentCallbackState(
    isRecordTableCellFocusActiveComponentState,
    recordTableId,
  );

  const recordTableFocusPositionCallbackState = useRecoilComponentCallbackState(
    recordTableFocusPositionComponentState,
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
        if (isRecordTableFocusActive) {
          set(isRecordTableFocusActiveCallbackState, true);
          set(recordTableFocusPositionCallbackState, cellPosition);
        } else {
          set(isRecordTableFocusActiveCallbackState, false);
          set(recordTableFocusPositionCallbackState, null);
        }
      },
    [
      isRecordTableFocusActiveCallbackState,
      recordTableFocusPositionCallbackState,
    ],
  );

  return {
    setIsRecordTableCellFocusActive,
  };
};
