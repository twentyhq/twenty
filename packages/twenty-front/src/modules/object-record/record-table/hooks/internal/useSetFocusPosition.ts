import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { isFocusActiveComponentState } from '@/object-record/record-table/states/isFocusActiveComponentState';
import { isFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isFocusOnTableCellComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetFocusPosition = (recordTableId?: string) => {
  const focusPositionState = useRecoilComponentCallbackStateV2(
    focusPositionComponentState,
    recordTableId,
  );
  const isFocusActiveState = useRecoilComponentCallbackStateV2(
    isFocusActiveComponentState,
    recordTableId,
  );
  const isFocusOnTableCellFamilyState = useRecoilComponentCallbackStateV2(
    isFocusOnTableCellComponentFamilyState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return (newPosition: TableCellPosition) => {
        const currentPosition = getSnapshotValue(snapshot, focusPositionState);

        set(isFocusActiveState, true);

        set(isFocusOnTableCellFamilyState(currentPosition), false);

        set(focusPositionState, newPosition);

        set(isFocusOnTableCellFamilyState(newPosition), true);

        document
          .getElementById(
            `record-table-cell-${newPosition.column}-${newPosition.row}`,
          )
          ?.classList.add('focus-mode');

        document
          .getElementById(
            `record-table-cell-${currentPosition.column}-${currentPosition.row}`,
          )
          ?.classList.remove('focus-mode');
      };
    },
    [focusPositionState, isFocusActiveState, isFocusOnTableCellFamilyState],
  );
};
