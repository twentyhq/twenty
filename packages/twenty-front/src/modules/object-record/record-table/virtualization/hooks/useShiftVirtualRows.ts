import { useStore } from 'jotai';
import { useCallback } from 'react';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { dataLoadingStatusByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentState';
import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { getDataPagesLoadedFromLoadingStatus } from '@/object-record/record-table/virtualization/utils/getDataPagesLoadedFromLoadingStatus';
import { shiftVirtualRowsFromRealIndex } from '@/object-record/record-table/virtualization/utils/shiftVirtualRowsFromRealIndex';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useShiftVirtualRows = () => {
  const store = useStore();

  const recordIdByRealIndexCallbackState = useAtomComponentStateCallbackState(
    recordIdByRealIndexComponentState,
  );

  const dataLoadingStatusByRealIndexCallbackState =
    useAtomComponentStateCallbackState(
      dataLoadingStatusByRealIndexComponentState,
    );

  const dataPagesLoadedCallbackState = useAtomComponentStateCallbackState(
    dataPagesLoadedComponentState,
  );

  const totalNumberOfRecordsToVirtualizeCallbackState =
    useAtomComponentStateCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const recordIndexRecordIdsByGroupFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { triggerFetchPages } = useTriggerFetchPages();

  const shiftVirtualRows = useCallback(
    ({
      fromRealIndex,
      shift,
      realIndexToDrop,
    }: {
      fromRealIndex: number;
      shift: 1 | -1;
      realIndexToDrop?: number;
    }) => {
      const allRecordIdsCallbackState = recordIndexRecordIdsByGroupFamilyState(
        NO_RECORD_GROUP_FAMILY_KEY,
      );

      const shifted = shiftVirtualRowsFromRealIndex({
        recordIdByRealIndex: store.get(recordIdByRealIndexCallbackState),
        dataLoadingStatusByRealIndex: store.get(
          dataLoadingStatusByRealIndexCallbackState,
        ),
        allRecordIds: store.get(allRecordIdsCallbackState),
        fromRealIndex,
        shift,
        realIndexToDrop,
      });

      const totalNumberOfRecordsToVirtualize =
        (store.get(totalNumberOfRecordsToVirtualizeCallbackState) ?? 0) + shift;

      store.set(recordIdByRealIndexCallbackState, shifted.recordIdByRealIndex);
      store.set(
        dataLoadingStatusByRealIndexCallbackState,
        shifted.dataLoadingStatusByRealIndex,
      );
      store.set(allRecordIdsCallbackState, shifted.allRecordIds);
      store.set(
        totalNumberOfRecordsToVirtualizeCallbackState,
        totalNumberOfRecordsToVirtualize,
      );
      store.set(
        dataPagesLoadedCallbackState,
        getDataPagesLoadedFromLoadingStatus({
          dataLoadingStatusByRealIndex: shifted.dataLoadingStatusByRealIndex,
          totalNumberOfRecordsToVirtualize,
        }),
      );

      triggerFetchPages();
    },
    [
      dataLoadingStatusByRealIndexCallbackState,
      dataPagesLoadedCallbackState,
      recordIdByRealIndexCallbackState,
      recordIndexRecordIdsByGroupFamilyState,
      store,
      totalNumberOfRecordsToVirtualizeCallbackState,
      triggerFetchPages,
    ],
  );

  const insertVirtualRowAtRealIndex = useCallback(
    (realIndex: number) =>
      shiftVirtualRows({ fromRealIndex: realIndex, shift: 1 }),
    [shiftVirtualRows],
  );

  const removeVirtualRowAtRealIndex = useCallback(
    (realIndex: number) =>
      shiftVirtualRows({
        fromRealIndex: realIndex + 1,
        shift: -1,
        realIndexToDrop: realIndex,
      }),
    [shiftVirtualRows],
  );

  return { insertVirtualRowAtRealIndex, removeVirtualRowAtRealIndex };
};
