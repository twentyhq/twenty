import { useRecoilCallback } from 'recoil';

import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { hasAlreadyFetchedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyFetchedUpToRealIndexComponentState';
import { lastRealIndexSetComponentState } from '@/object-record/record-table/virtualization/states/lastRealIndexSetComponentState';
import { recordIdPerRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdPerRealIndexComponentFamilyState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedFetchMoreEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { fetchMoreRecordsLazy } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const lastRealIndexSet = useRecoilComponentValue(
    lastRealIndexSetComponentState,
  );

  const [hasAlreadyFetchedUpToRealIndex] = useRecoilComponentState(
    hasAlreadyFetchedUpToRealIndexComponentState,
  );

  const hasAlreadyFetchedUpToRealIndexCallbackState =
    useRecoilComponentCallbackState(
      hasAlreadyFetchedUpToRealIndexComponentState,
    );

  const hasRecordTableFetchedAllRecordsCallbackState =
    useRecoilComponentCallbackState(
      hasRecordTableFetchedAllRecordsComponentState,
    );

  const recordIdPerRealIndexFamilyCallbackState =
    useRecoilComponentCallbackState(recordIdPerRealIndexComponentFamilyState);

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

              const pages = Math.floor(records.length / pagingForUIUpdate);

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
                      recordIdPerRealIndexFamilyCallbackState(realIndexToSet),
                      records[indexOfCurrentRecordBatch].id,
                    );

                    set(
                      recordStoreFamilyState(
                        records[indexOfCurrentRecordBatch].id,
                      ),
                      records[indexOfCurrentRecordBatch],
                    );
                  }

                  indexOfCurrentRecordBatch++;
                }
              }

              set(
                hasAlreadyFetchedUpToRealIndexCallbackState,
                startingRealIndex + records.length,
              );
            }

            set(
              hasRecordTableFetchedAllRecordsCallbackState,
              result?.data?.pageInfo.hasNextPage === false,
            );
          }

          set(isFetchingMoreRecordsFamilyState(recordTableId), false);
        });
      },
    [
      fetchMoreRecordsLazy,
      hasAlreadyFetchedUpToRealIndexCallbackState,
      hasRecordTableFetchedAllRecordsCallbackState,
      recordIdPerRealIndexFamilyCallbackState,
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
