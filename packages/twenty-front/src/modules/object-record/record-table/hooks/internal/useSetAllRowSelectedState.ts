import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useSetAllRowSelectedState = (recordTableId?: string) => {
  const { isAllRowSelectedFamilyState } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        set(isAllRowSelectedFamilyState('all'), selected);
      },
    [isAllRowSelectedFamilyState],
  );
};
