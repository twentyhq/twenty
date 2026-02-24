import { useCallback } from 'react';
import { useStore } from 'jotai';

import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';

export const useResetVirtualizedRowTreadmill = () => {
  const realIndexByVirtualIndexCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      realIndexByVirtualIndexComponentFamilyState,
    );

  const store = useStore();

  const resetVirtualizedRowTreadmill = useCallback(() => {
    const virtualIndices = getContiguousIncrementalValues(
      NUMBER_OF_VIRTUALIZED_ROWS,
    );

    for (const virtualIndex of virtualIndices) {
      const realIndex = virtualIndex;

      store.set(
        realIndexByVirtualIndexCallbackState({
          virtualIndex: virtualIndex,
        }),
        realIndex,
      );
    }
  }, [realIndexByVirtualIndexCallbackState, store]);

  return { resetVirtualizedRowTreadmill };
};
