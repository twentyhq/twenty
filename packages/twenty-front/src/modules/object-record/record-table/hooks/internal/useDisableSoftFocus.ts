import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useDisableSoftFocus = (recordTableId?: string) => {
  const {
    getSoftFocusPositionState,
    getIsSoftFocusActiveState,
    isSoftFocusOnTableCellFamilyState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return () => {
        const currentPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
        );

        set(getIsSoftFocusActiveState(), false);

        set(isSoftFocusOnTableCellFamilyState(currentPosition), false);
      };
    },
    [
      getIsSoftFocusActiveState,
      getSoftFocusPositionState,
      isSoftFocusOnTableCellFamilyState,
    ],
  );
};
