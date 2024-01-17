import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetSoftFocusPosition = (recordTableId?: string) => {
  const {
    getSoftFocusPositionState,
    getIsSoftFocusActiveState,
    isSoftFocusOnTableCellFamilyState,
  } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return (newPosition: TableCellPosition) => {
        const currentPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
        );

        set(getIsSoftFocusActiveState(), true);

        set(isSoftFocusOnTableCellFamilyState(currentPosition), false);

        set(getSoftFocusPositionState(), newPosition);

        set(isSoftFocusOnTableCellFamilyState(newPosition), true);
      };
    },
    [
      getSoftFocusPositionState,
      getIsSoftFocusActiveState,
      isSoftFocusOnTableCellFamilyState,
    ],
  );
};
