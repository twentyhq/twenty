import { useRecoilCallback } from 'recoil';

import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetIsFocusActive } from '../../record-table-cell/hooks/useSetIsFocusActive';
import { TableCellPosition } from '../../types/TableCellPosition';
export const useSetFocusPosition = (recordTableId?: string) => {
  const focusPositionState = useRecoilComponentCallbackStateV2(
    focusPositionComponentState,
    recordTableId,
  );

  const { setIsFocusActive, setIsFocusActiveForCurrentPosition } =
    useSetIsFocusActive(recordTableId);

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
