import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import { RowIdContext } from '../../contexts/RowIdContext';

export const useCurrentRowSelected = () => {
  const currentRowId = useContext(RowIdContext);

  const { isRowSelectedScopeInjector } = getRecordTableScopeInjector();

  const {
    injectFamilyStateWithRecordTableScopeId,
    injectFamilySnapshotValueWithRecordTableScopeId,
  } = useRecordTableScopedStates();

  const isRowSelectedFamilyState = injectFamilyStateWithRecordTableScopeId(
    isRowSelectedScopeInjector,
  );

  const isRowSelected = useRecoilValue(
    isRowSelectedFamilyState(currentRowId ?? ''),
  );

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (newSelectedState: boolean) => {
        if (!currentRowId) return;

        const isRowSelected = injectFamilySnapshotValueWithRecordTableScopeId(
          snapshot,
          isRowSelectedScopeInjector,
        )(currentRowId);

        if (newSelectedState && !isRowSelected) {
          set(isRowSelectedFamilyState(currentRowId), true);
        } else if (!newSelectedState && isRowSelected) {
          set(isRowSelectedFamilyState(currentRowId), false);
        }
      },
    [
      currentRowId,
      injectFamilySnapshotValueWithRecordTableScopeId,
      isRowSelectedFamilyState,
      isRowSelectedScopeInjector,
    ],
  );

  return {
    currentRowSelected: isRowSelected,
    setCurrentRowSelected,
  };
};
