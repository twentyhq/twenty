import { useRecoilCallback } from 'recoil';

import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { isFocusActiveComponentState } from '@/object-record/record-table/states/isFocusActiveComponentState';
import { isFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isFocusOnTableCellComponentFamilyState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useDisableFocus = (recordTableId?: string) => {
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
      return () => {
        const currentPosition = getSnapshotValue(snapshot, focusPositionState);

        set(isFocusActiveState, false);

        set(isFocusOnTableCellFamilyState(currentPosition), false);
      };
    },
    [isFocusActiveState, focusPositionState, isFocusOnTableCellFamilyState],
  );
};
