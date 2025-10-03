import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';

export const useResetVirtualizedRowTreadmill = () => {
  const realIndexByVirtualIndexCallbackState = useRecoilComponentCallbackState(
    realIndexByVirtualIndexComponentFamilyState,
  );

  const resetVirtualizedRowTreadmill = useRecoilCallback(
    ({ set }) =>
      () => {
        const virtualIndices = getContiguousIncrementalValues(
          NUMBER_OF_VIRTUALIZED_ROWS,
        );

        for (const virtualIndex of virtualIndices) {
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
