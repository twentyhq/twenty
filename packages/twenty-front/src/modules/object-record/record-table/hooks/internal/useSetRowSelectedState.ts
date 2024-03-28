import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useSetRowSelectedState = (recordTableId?: string) => {
  const { isRowSelectedFamilyState } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set }) =>
      (rowId: string, selected: boolean) => {
        set(isRowSelectedFamilyState(rowId), selected);
      },
    [isRowSelectedFamilyState],
  );
};
