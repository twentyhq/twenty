import { useRecoilCallback } from 'recoil';

import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { hasAlreadyFetchedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyFetchedUpToRealIndexComponentState';
import { lastRealIndexSetComponentState } from '@/object-record/record-table/virtualization/states/lastRealIndexSetComponentState';

import { useResetNumberOfRecordsToVirtualize } from '@/object-record/record-table/virtualization/hooks/useResetNumberOfRecordsToVirtualize';
import { useResetVirtualizedRowTreadmill } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizedRowTreadmill';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useCallback, useEffect } from 'react';
import { getRange, isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedDataLoaderEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { fetchMoreRecordsLazy, findManyRecordsLazy, queryIdentifier } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const lastRealIndexSet = useRecoilComponentValue(
    lastRealIndexSetComponentState,
  );

  const [hasAlreadyFetchedUpToRealIndex] = useRecoilComponentState(
    hasAlreadyFetchedUpToRealIndexComponentState,
  );

  const lastRecordTableQueryIdentifier = useRecoilComponentValue(
    lastRecordTableQueryIdentifierComponentState,
  );

  const hasAlreadyFetchedUpToRealIndexCallbackState =
    useRecoilComponentCallbackState(
      hasAlreadyFetchedUpToRealIndexComponentState,
    );

  const hasRecordTableFetchedAllRecordsCallbackState =
    useRecoilComponentCallbackState(
      hasRecordTableFetchedAllRecordsComponentState,
    );

  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const { scrollToPosition } = useScrollToPosition();

  const { resetVirtualizedRowTreadmill } = useResetVirtualizedRowTreadmill();
  const { resetNumberOfRecordsToVirtualize } =
    useResetNumberOfRecordsToVirtualize();

  const resetRecordTableVirtualDataLoading = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const lastFetchedRealIndex = getSnapshotValue(
          snapshot,
          hasAlreadyFetchedUpToRealIndexCallbackState,
        );

        if (isDefined(lastFetchedRealIndex) && lastFetchedRealIndex > 0) {
          for (const realIndex of getRange(0, lastFetchedRealIndex)) {
            set(recordIdByRealIndexCallbackState({ realIndex }), null);
          }
        }

        set(hasAlreadyFetchedUpToRealIndexCallbackState, null);
        set(hasRecordTableFetchedAllRecordsCallbackState, false);
      },
    [
      hasAlreadyFetchedUpToRealIndexCallbackState,
      hasRecordTableFetchedAllRecordsCallbackState,
      recordIdByRealIndexCallbackState,
    ],
  );

  const triggerNewFreshFirstDataLoad = useCallback(async () => {
    const { records, error, data, totalCount, hasNextPage } =
      await findManyRecordsLazy();

    if (isDefined(records)) {
      resetVirtualizedRowTreadmill();

      scrollToPosition(0);

      resetNumberOfRecordsToVirtualize({
        records,
        totalCount,
      });

      resetRecordTableVirtualDataLoading();
    }
  }, [
    findManyRecordsLazy,
    resetVirtualizedRowTreadmill,
    resetNumberOfRecordsToVirtualize,
    scrollToPosition,
    resetRecordTableVirtualDataLoading,
  ]);

  useEffect(() => {
    if (queryIdentifier !== lastRecordTableQueryIdentifier) {
      resetRecordTableVirtualDataLoading();

      triggerNewFreshFirstDataLoad();
    }
  }, [
    queryIdentifier,
    lastRecordTableQueryIdentifier,
    resetRecordTableVirtualDataLoading,
    triggerNewFreshFirstDataLoad,
  ]);

  // TODO: Those parameters allow the UI to not freeze while it can take time to fetch data.
  // We should work on two additional optimization rounds :
  //   - A row take too much time to render
  //   - Requests are too eagerly loading relationships.
  const TIME_BETWEEN_UI_BATCH_UPDATE = 50; // 50 is good
  const FETCH_MORE_NUMBER = 150; // 150 is good, must be a multiple of PAGING_FOR_UI_UPDATE
  const PAGING_FOR_UI_UPDATE = 10; // 10 works well
  const TIME_BETWEEN_TWO_REQUETS = 500;

  const triggerNewFetchMore = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const isFetchingMoreRecords = getSnapshotValue(
          snapshot,
          isFetchingMoreRecordsFamilyState(recordTableId),
        );

        if (isFetchingMoreRecords) {
          return;
        }

        set(isFetchingMoreRecordsFamilyState(recordTableId), true);

        const hasAlreadyFetchedUpToRealIndexSnapshotValue = getSnapshotValue(
          snapshot,
          hasAlreadyFetchedUpToRealIndexCallbackState,
        );

        fetchMoreRecordsLazy(FETCH_MORE_NUMBER).then(async (result) => {
          if (!isDefined(result?.error)) {
            const records = result?.records;

            const startingRealIndex =
              hasAlreadyFetchedUpToRealIndexSnapshotValue ?? 0;

            if (isDefined(records)) {
              const pagingForUIUpdate = PAGING_FOR_UI_UPDATE;

              const pages = Math.ceil(records.length / pagingForUIUpdate);

              let indexOfCurrentRecordBatch = 0;

              for (let page = 0; page < pages; page++) {
                await new Promise<void>((res) =>
                  setTimeout(() => res(), TIME_BETWEEN_UI_BATCH_UPDATE),
                );

                const startingRealIndexInThisPage =
                  startingRealIndex + page * pagingForUIUpdate;

                const endingRealIndexInThisPage =
                  startingRealIndexInThisPage + pagingForUIUpdate;

                for (
                  let realIndexToSet = startingRealIndexInThisPage;
                  realIndexToSet < endingRealIndexInThisPage;
                  realIndexToSet++
                ) {
                  if (isDefined(records[indexOfCurrentRecordBatch])) {
                    set(
                      recordIdByRealIndexCallbackState({
                        realIndex: realIndexToSet,
                      }),
                      records[indexOfCurrentRecordBatch].id,
                    );
                  }

                  indexOfCurrentRecordBatch++;
                }
              }

              set(
                hasAlreadyFetchedUpToRealIndexCallbackState,
                startingRealIndex + records.length,
              );

              set(
                hasRecordTableFetchedAllRecordsCallbackState,
                result?.data?.pageInfo.hasNextPage === false,
              );
            }
          }

          set(isFetchingMoreRecordsFamilyState(recordTableId), false);
        });
      },
    [
      fetchMoreRecordsLazy,
      hasAlreadyFetchedUpToRealIndexCallbackState,
      hasRecordTableFetchedAllRecordsCallbackState,
      recordIdByRealIndexCallbackState,
      recordTableId,
    ],
  );

  const triggerNewFetchMoreDebounced = useDebouncedCallback(
    triggerNewFetchMore,
    TIME_BETWEEN_TWO_REQUETS,
    {
      maxWait: TIME_BETWEEN_TWO_REQUETS,
    },
  );

  useEffect(() => {
    if ((lastRealIndexSet ?? 0) > (hasAlreadyFetchedUpToRealIndex ?? 0)) {
      triggerNewFetchMoreDebounced();
    }
  }, [
    lastRealIndexSet,
    hasAlreadyFetchedUpToRealIndex,
    triggerNewFetchMoreDebounced,
  ]);

  return null;
};
