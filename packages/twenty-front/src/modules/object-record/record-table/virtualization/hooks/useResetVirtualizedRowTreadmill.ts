import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { getRange } from 'twenty-shared/utils';

export const useResetVirtualizedRowTreadmill = () => {
  const realIndexByVirtualIndexCallbackState = useRecoilComponentCallbackState(
    realIndexByVirtualIndexComponentFamilyState,
  );

  const resetVirtualizedRowTreadmill = useRecoilCallback(
    ({ set }) =>
      () => {
        for (const virtualIndex of getRange(0, NUMBER_OF_VIRTUALIZED_ROWS)) {
          const realIndex = virtualIndex;

          set(
            realIndexByVirtualIndexCallbackState({
              virtualIndex: virtualIndex,
            }),
            realIndex,
          );
        }
      },
    [realIndexByVirtualIndexCallbackState],
  );

  return { resetVirtualizedRowTreadmill };
};
