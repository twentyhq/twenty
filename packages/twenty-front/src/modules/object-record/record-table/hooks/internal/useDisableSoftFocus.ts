import { useRecoilCallback } from 'recoil';
import { getSnapshotValue } from 'twenty-ui';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useDisableSoftFocus = (recordTableId?: string) => {
  const {
    softFocusPositionState,
    isSoftFocusActiveState,
    isSoftFocusOnTableCellFamilyState,
  } = useRecordTableStates(recordTableId);

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
