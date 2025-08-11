import { useRecoilCallback } from 'recoil';

import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useSetRowSelectedState = (recordTableId?: string) => {
  const isRowSelectedFamilyState = useRecoilComponentCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  return useRecoilCallback(
    ({ set }) =>
      (rowId: string, selected: boolean) => {
        set(isRowSelectedFamilyState(rowId), selected);
      },
    [isRowSelectedFamilyState],
  );
};
