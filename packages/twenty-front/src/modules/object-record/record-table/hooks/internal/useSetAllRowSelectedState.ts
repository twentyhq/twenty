import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useSetHasUserSelectedAllRows = (recordTableId?: string) => {
  const { hasUserSelectedAllRowsState } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        set(hasUserSelectedAllRowsState, selected);
      },
    [hasUserSelectedAllRowsState],
  );
};
