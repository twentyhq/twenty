import { useRecoilCallback } from 'recoil';

import { useSetIsFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsFocusActive';
import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { isFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isFocusOnTableCellComponentFamilyState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useDisableFocus = (recordTableId?: string) => {
  const focusPositionState = useRecoilComponentCallbackStateV2(
    focusPositionComponentState,
    recordTableId,
  );

  const isFocusOnTableCellFamilyState = useRecoilComponentCallbackStateV2(
    isFocusOnTableCellComponentFamilyState,
    recordTableId,
  );

  const setIsFocusActive = useSetIsFocusActive(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return () => {
        const currentPosition = getSnapshotValue(snapshot, focusPositionState);

        setIsFocusActive(false);

        set(isFocusOnTableCellFamilyState(currentPosition), false);
      };
    },
    [focusPositionState, isFocusOnTableCellFamilyState, setIsFocusActive],
  );
};
