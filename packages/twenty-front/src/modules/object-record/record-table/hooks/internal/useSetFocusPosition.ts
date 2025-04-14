import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { isSoftFocusActiveComponentState } from '@/object-record/record-table/states/isSoftFocusActiveComponentState';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetSoftFocusPosition = (recordTableId?: string) => {
  const focusPositionState = useRecoilComponentCallbackStateV2(
    focusPositionComponentState,
    recordTableId,
  );
  const isSoftFocusActiveState = useRecoilComponentCallbackStateV2(
    isSoftFocusActiveComponentState,
    recordTableId,
  );
  const isSoftFocusOnTableCellFamilyState = useRecoilComponentCallbackStateV2(
    isSoftFocusOnTableCellComponentFamilyState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return (newPosition: TableCellPosition) => {
        const currentPosition = getSnapshotValue(snapshot, focusPositionState);

        set(isSoftFocusActiveState, true);

        set(isSoftFocusOnTableCellFamilyState(currentPosition), false);

        set(focusPositionState, newPosition);

        set(isSoftFocusOnTableCellFamilyState(newPosition), true);
      };
    },
    [
      focusPositionState,
      isSoftFocusActiveState,
      isSoftFocusOnTableCellFamilyState,
    ],
  );
};
