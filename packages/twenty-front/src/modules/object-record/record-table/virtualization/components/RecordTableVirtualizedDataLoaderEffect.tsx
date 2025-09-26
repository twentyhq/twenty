import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { hasAlreadyLoadedDataUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyLoadedDataUpToRealIndexComponentState';
import { hasAlreadyVirtualyRenderedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyVirtualyRenderedUpToRealIndexComponentState';

import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useAppendRecordIds } from '@/object-record/record-table/virtualization/hooks/useAppendRecordIds';
import { useAssignRecordsToStore } from '@/object-record/record-table/virtualization/hooks/useAssignRecordsToStore';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { useReapplyRowSelection } from '@/object-record/record-table/virtualization/hooks/useReapplyRowSelection';
import { useResetNumberOfRecordsToVirtualize } from '@/object-record/record-table/virtualization/hooks/useResetNumberOfRecordsToVirtualize';
import { useResetRecordIds } from '@/object-record/record-table/virtualization/hooks/useResetRecordIds';
import { useResetTableFocuses } from '@/object-record/record-table/virtualization/hooks/useResetTableFocuses';
import { useResetVirtualizedRowTreadmill } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizedRowTreadmill';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect } from 'react';
import { getRange, isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedDataLoaderEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { fetchMoreRecordsLazy, findManyRecordsLazy, queryIdentifier } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const hasAlreadyVirtualyRenderedUpToRealIndex = useRecoilComponentValue(
    hasAlreadyVirtualyRenderedUpToRealIndexComponentState,
  );

  const [hasAlreadyFetchedUpToRealIndex] = useRecoilComponentState(
    hasAlreadyLoadedDataUpToRealIndexComponentState,
  );

  const [lastRecordTableQueryIdentifier, setLastRecordTableQueryIdentifier] =
    useRecoilComponentState(lastRecordTableQueryIdentifierComponentState);

  const [
    isInitializingVirtualTableDataLoading,
    setIsInitializingVirtualTableDataLoading,
  ] = useRecoilComponentState(
    isInitializingVirtualTableDataLoadingComponentState,
  );

  const isInitializingVirtualTableDataLoadingCallbackState =
    useRecoilComponentCallbackState(
      isInitializingVirtualTableDataLoadingComponentState,
    );

  const hasAlreadyFetchedUpToRealIndexCallbackState =
    useRecoilComponentCallbackState(
      hasAlreadyLoadedDataUpToRealIndexComponentState,
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

  const { resetTableFocuses } = useResetTableFocuses(recordTableId);
  const { assignRecordsToStore } = useAssignRecordsToStore();

  const [isRecordTableInitialLoading, setIsRecordTableInitialLoading] =
    useRecoilComponentState(isRecordTableInitialLoadingComponentState);

  const { resetRecordIds } = useResetRecordIds();
  const { appendRecordIds } = useAppendRecordIds();

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();

  const { reapplyRowSelection } = useReapplyRowSelection();

  const isFetchingMoreRecords = useRecoilValue(
    isFetchingMoreRecordsFamilyState(recordTableId),
  );

  const triggerInitialRecordTableDataLoad = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const isInitializing = getSnapshotValue(
          snapshot,
          isInitializingVirtualTableDataLoadingCallbackState,
        );

        if (isInitializing) {
          return;
        }

        set(isInitializingVirtualTableDataLoadingCallbackState, true);

        console.log('triggerInitialRecordTableDataLoad');

        resetTableFocuses();

        resetVirtualizedRowTreadmill();

        resetRecordTableVirtualDataLoading();

        scrollToPosition(0);

        const { records, totalCount, hasNextPage } =
          await findManyRecordsLazy();

        if (isDefined(records)) {
          resetNumberOfRecordsToVirtualize({
            records,
            totalCount,
          });

          assignRecordsToStore({ records });

          loadRecordsToVirtualRows({
            records,
            startingRealIndex: 0,
          });

          resetRecordIds({ records });

          reapplyRowSelection();
        }

        if (!hasNextPage) {
          set(hasRecordTableFetchedAllRecordsCallbackState, true);
        }

        set(isInitializingVirtualTableDataLoadingCallbackState, false);
      },
    [
      findManyRecordsLazy,
      resetVirtualizedRowTreadmill,
      resetNumberOfRecordsToVirtualize,
      scrollToPosition,
      resetRecordTableVirtualDataLoading,
      loadRecordsToVirtualRows,
      assignRecordsToStore,
      resetTableFocuses,
      resetRecordIds,
      reapplyRowSelection,
      isInitializingVirtualTableDataLoadingCallbackState,
      hasRecordTableFetchedAllRecordsCallbackState,
    ],
  );

  useEffect(() => {
    if (isInitializingVirtualTableDataLoading) {
      return;
    }

    (async () => {
      if (
        queryIdentifier !== lastRecordTableQueryIdentifier &&
        !isFetchingMoreRecords
      ) {
        setLastRecordTableQueryIdentifier(queryIdentifier);

        await triggerInitialRecordTableDataLoad();

        setIsRecordTableInitialLoading(false);
      }
    })();
  }, [
    queryIdentifier,
    lastRecordTableQueryIdentifier,
    resetRecordTableVirtualDataLoading,
    triggerInitialRecordTableDataLoad,
    setLastRecordTableQueryIdentifier,
    isFetchingMoreRecords,
    isRecordTableInitialLoading,
    setIsRecordTableInitialLoading,
    isInitializingVirtualTableDataLoading,
    setIsInitializingVirtualTableDataLoading,
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

              for (let page = 0; page < pages; page++) {
                await new Promise<void>((res) =>
                  setTimeout(() => res(), TIME_BETWEEN_UI_BATCH_UPDATE),
                );

                const startingRealIndexInThisPage =
                  startingRealIndex + page * pagingForUIUpdate;

                const startingSliceIndexInThisPage = page * pagingForUIUpdate;
                const endingSliceIndexInThisPage =
                  startingSliceIndexInThisPage + pagingForUIUpdate;

                const recordsSlice = records.slice(
                  startingSliceIndexInThisPage,
                  endingSliceIndexInThisPage,
                );

                loadRecordsToVirtualRows({
                  records: recordsSlice,
                  startingRealIndex: startingRealIndexInThisPage,
                });

                assignRecordsToStore({ records: recordsSlice });

                appendRecordIds({ records: recordsSlice });
              }

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
      recordTableId,
      loadRecordsToVirtualRows,
      appendRecordIds,
      assignRecordsToStore,
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
    const dataLoadingIsLaggingBehindVirtualRowsUIRendering =
      (hasAlreadyVirtualyRenderedUpToRealIndex ?? 0) >
      (hasAlreadyFetchedUpToRealIndex ?? 0);

    if (
      dataLoadingIsLaggingBehindVirtualRowsUIRendering &&
      !isInitializingVirtualTableDataLoading &&
      !isFetchingMoreRecords
    ) {
      triggerNewFetchMoreDebounced();
    }
  }, [
    hasAlreadyVirtualyRenderedUpToRealIndex,
    hasAlreadyFetchedUpToRealIndex,
    triggerNewFetchMoreDebounced,
    isInitializingVirtualTableDataLoading,
    isFetchingMoreRecords,
  ]);

  return null;
};
