import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useCurrentRowSelected = () => {
  const { recordId } = useContext(RecordTableRowContext);

  const { isRowSelectedFamilyState } = useRecordTableStates();

  const isRowSelected = useRecoilValue(isRowSelectedFamilyState(recordId));

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (newSelectedState: boolean) => {
        const isRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(recordId),
        );

        if (newSelectedState && !isRowSelected) {
          set(isRowSelectedFamilyState(recordId), true);
        } else if (!newSelectedState && isRowSelected) {
          set(isRowSelectedFamilyState(recordId), false);
        }
      },
    [recordId, isRowSelectedFamilyState],
  );

  return {
    currentRowSelected: isRowSelected,
    setCurrentRowSelected,
  };
};
