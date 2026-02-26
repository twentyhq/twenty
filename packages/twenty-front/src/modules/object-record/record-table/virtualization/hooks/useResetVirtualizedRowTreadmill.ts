import { useCallback } from 'react';
import { useStore } from 'jotai';

import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';

export const useResetVirtualizedRowTreadmill = () => {
  const realIndexByVirtualIndexCallbackState =
    useAtomComponentFamilyStateCallbackState(
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
