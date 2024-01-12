import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { RowIdContext } from '../../contexts/RowIdContext';

export const useCurrentRowSelected = () => {
  const currentRowId = useContext(RowIdContext);

  const { isRowSelectedFamilyState } = useRecordTableStates();

  const isRowSelected = useRecoilValue(
    isRowSelectedFamilyState(currentRowId ?? ''),
  );

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (newSelectedState: boolean) => {
        if (!currentRowId) return;

        const isRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(currentRowId),
        );

        if (newSelectedState && !isRowSelected) {
          set(isRowSelectedFamilyState(currentRowId), true);
        } else if (!newSelectedState && isRowSelected) {
          set(isRowSelectedFamilyState(currentRowId), false);
        }
      },
    [currentRowId, isRowSelectedFamilyState],
  );

  return {
    currentRowSelected: isRowSelected,
    setCurrentRowSelected,
  };
};
