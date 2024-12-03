import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveComponentState } from '@/object-record/record-table/states/isSoftFocusActiveComponentState';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { softFocusPositionComponentState } from '@/object-record/record-table/states/softFocusPositionComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useDisableSoftFocus = (recordTableId?: string) => {
  const softFocusPositionState = useRecoilComponentCallbackStateV2(
    softFocusPositionComponentState,
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
      return () => {
        const currentPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        set(isSoftFocusActiveState, false);

        set(isSoftFocusOnTableCellFamilyState(currentPosition), false);
      };
    },
    [
      isSoftFocusActiveState,
      softFocusPositionState,
      isSoftFocusOnTableCellFamilyState,
    ],
  );
};
