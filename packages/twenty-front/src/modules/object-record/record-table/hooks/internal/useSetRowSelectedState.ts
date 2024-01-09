import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

export const useSetRowSelectedState = (recordTableScopeId: string) => {
  const { isRowSelectedScopeInjector } = getRecordTableScopeInjector();

  const { injectFamilyStateWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableScopeId);

  const isRowSelectedFamilyState = injectFamilyStateWithRecordTableScopeId(
    isRowSelectedScopeInjector,
  );

  return useRecoilCallback(({ set }) => (rowId: string, selected: boolean) => {
    set(isRowSelectedFamilyState(rowId), selected);
  });
};
