import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { getSnapshotValue } from 'twenty-ui';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

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
