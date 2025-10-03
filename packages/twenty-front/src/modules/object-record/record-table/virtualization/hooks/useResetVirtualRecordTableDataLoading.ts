import { hasAlreadyLoadedDataUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyLoadedDataUpToRealIndexComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { getContiguousIncrementalValues, isDefined } from 'twenty-shared/utils';

export const useResetVirtualRecordTableDataLoading = () => {
  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const hasAlreadyFetchedUpToRealIndexCallbackState =
    useRecoilComponentCallbackState(
      hasAlreadyLoadedDataUpToRealIndexComponentState,
    );

  const resetRecordTableVirtualDataLoading = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const lastFetchedRealIndex = getSnapshotValue(
          snapshot,
          hasAlreadyFetchedUpToRealIndexCallbackState,
        );

        if (isDefined(lastFetchedRealIndex) && lastFetchedRealIndex > 0) {
          const realIndices =
            getContiguousIncrementalValues(lastFetchedRealIndex);

          for (const realIndex of realIndices) {
            set(recordIdByRealIndexCallbackState({ realIndex }), null);
          }
        }

        set(hasAlreadyFetchedUpToRealIndexCallbackState, null);
      },
    [
      hasAlreadyFetchedUpToRealIndexCallbackState,
      recordIdByRealIndexCallbackState,
    ],
  );

  return {
    resetRecordTableVirtualDataLoading,
  };
};
