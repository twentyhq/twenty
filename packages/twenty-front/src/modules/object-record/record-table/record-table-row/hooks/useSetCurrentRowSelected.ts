import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useSetCurrentRowSelected = () => {
  const { recordId } = useContext(RecordTableRowContext);

  const { isRowSelectedFamilyState } = useRecordTableStates();

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (newSelectedState: boolean) => {
        const isRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(recordId),
        );

        if (isRowSelected !== newSelectedState) {
          set(isRowSelectedFamilyState(recordId), newSelectedState);
        }
      },
    [recordId, isRowSelectedFamilyState],
  );

  return {
    setCurrentRowSelected,
  };
};
