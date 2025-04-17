import { useRecoilCallback } from 'recoil';

import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetIsRecordTableFocusActive } from '../../record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetRecordTableFocusPosition = (recordTableId?: string) => {
  const focusPositionState = useRecoilComponentCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const { setIsFocusActive, setIsFocusActiveForCurrentPosition } =
    useSetIsRecordTableFocusActive(recordTableId);

  return useRecoilCallback(
    ({ set }) => {
      return (newPosition: TableCellPosition) => {
        set(focusPositionState, newPosition);

        setIsFocusActiveForCurrentPosition(false);
        setIsFocusActive(true, newPosition);
      };
    },
    [focusPositionState, setIsFocusActive, setIsFocusActiveForCurrentPosition],
  );
};
