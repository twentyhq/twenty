import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useSetRowSelectedState = (recordTableScopeId: string) => {
  const { isRowSelectedFamilyState } = useRecordTableStates(recordTableScopeId);

  return useRecoilCallback(({ set }) => (rowId: string, selected: boolean) => {
    set(isRowSelectedFamilyState(rowId), selected);
  });
};
