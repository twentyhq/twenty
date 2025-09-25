import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { loadingStatusPerRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/loadingStatusPerRealIndexComponentFamilyState';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { recordIdPerRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdPerRealIndexComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { getRange } from 'twenty-shared/utils';

export const useInitializeRowVirtualization = () => {
  const realIndexByVirtualIndexCallbackState = useRecoilComponentCallbackState(
    realIndexByVirtualIndexComponentFamilyState,
  );

  const recordIdPerRealIndexFamilyCallbackState =
    useRecoilComponentCallbackState(recordIdPerRealIndexComponentFamilyState);

  const loadingStatusPerRealIndexFamilyCallbackState =
    useRecoilComponentCallbackState(
      loadingStatusPerRealIndexComponentFamilyState,
    );

  const initializeRowsVirtualization = useRecoilCallback(
    ({ set }) =>
      (records: ObjectRecord[]) => {
        for (const virtualIndex of getRange(0, NUMBER_OF_VIRTUALIZED_ROWS)) {
          const realIndex = virtualIndex;

          set(
            realIndexByVirtualIndexCallbackState({
              virtualIndex: virtualIndex,
            }),
            realIndex,
          );

          set(
            recordIdPerRealIndexFamilyCallbackState(realIndex),
            records[realIndex]?.id,
          );

          set(loadingStatusPerRealIndexFamilyCallbackState({ realIndex }), {
            fullyLoaded: true,
          });
        }
      },
    [
      realIndexByVirtualIndexCallbackState,
      recordIdPerRealIndexFamilyCallbackState,
      loadingStatusPerRealIndexFamilyCallbackState,
    ],
  );

  return { initializeRowsVirtualization };
};
