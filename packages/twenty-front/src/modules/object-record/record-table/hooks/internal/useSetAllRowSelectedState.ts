import { useRecoilCallback } from 'recoil';

import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useSetHasUserSelectedAllRows = (recordTableId?: string) => {
  const hasUserSelectedAllRowsState = useRecoilComponentCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        set(hasUserSelectedAllRowsState, selected);
      },
    [hasUserSelectedAllRowsState],
  );
};
