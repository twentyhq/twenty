import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { isFocusActiveComponentState } from '@/object-record/record-table/states/isFocusActiveComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useSetIsFocusActive = (recordTableId?: string) => {
  const focusPositionState = useRecoilComponentCallbackStateV2(
    focusPositionComponentState,
    recordTableId,
  );

  const isFocusActiveState = useRecoilComponentCallbackStateV2(
    isFocusActiveComponentState,
    recordTableId,
  );

  const setIsFocusActive = useRecoilCallback(
    ({ snapshot, set }) =>
      (isFocusActive: boolean) => {
        const currentPosition = getSnapshotValue(snapshot, focusPositionState);

        if (isFocusActive) {
          document
            .getElementById(
              `record-table-cell-${currentPosition.column}-${currentPosition.row}`,
            )
            ?.classList.add('focus-active');
        }

        if (!isFocusActive) {
          document
            .getElementById(
              `record-table-cell-${currentPosition.column}-${currentPosition.row}`,
            )
            ?.classList.remove('focus-active');
        }

        set(isFocusActiveState, isFocusActive);
      },
    [focusPositionState, isFocusActiveState],
  );

  return setIsFocusActive;
};
