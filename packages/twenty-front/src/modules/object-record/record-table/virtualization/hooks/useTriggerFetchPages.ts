import { useStore } from 'jotai';
import { useCallback } from 'react';
import { getContiguousIncrementalValues, isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { useLazyFindManyRecordsWithOffset } from '@/object-record/hooks/useLazyFindManyRecordsWithOffset';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfRecordsPerPage';
import { useLoadRecordsAtRowIndexes } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsAtRowIndexes';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';
import { numberOfPendingPageFetchesComponentState } from '@/object-record/record-table/virtualization/states/numberOfPendingPageFetchesComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { getPagesWithUnloadedRows } from '@/object-record/record-table/virtualization/utils/getPagesWithUnloadedRows';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

const TIME_BETWEEN_UI_BATCH_UPDATE = 25;
const PAGING_FOR_UI_UPDATE = 10;
const TIME_BETWEEN_TWO_REQUESTS = 25;

export const useTriggerFetchPages = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();
  const store = useStore();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { loadRecordsAtRowIndexes } = useLoadRecordsAtRowIndexes();

  const { findManyRecordsLazyWithOffset } = useLazyFindManyRecordsWithOffset({
    objectNameSingular,
  });

  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const lastScrollPositionCallbackState = useAtomComponentStateCallbackState(
    lastScrollPositionComponentState,
  );

  const lowDetailsActivatedCallbackState = useAtomComponentStateCallbackState(
    lowDetailsActivatedComponentState,
  );

  const numberOfPendingPageFetchesCallbackState =
    useAtomComponentStateCallbackState(
      numberOfPendingPageFetchesComponentState,
    );

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const triggerFetchPagesWithoutDebounce = useCallback(
    async ({
      shouldRefetchLoadedPages = false,
    }: { shouldRefetchLoadedPages?: boolean } = {}) => {
      if (store.get(lowDetailsActivatedCallbackState)) {
        return;
      }

      const totalNumberOfRows = store.get(totalNumberOfRowsCallbackState) ?? 0;

      const { overscanPageAtBottom, overscanPageAtTop } =
        getVirtualizationOverscanWindow({
          scrollPosition: store.get(lastScrollPositionCallbackState),
          scrollWrapperHeight:
            getScrollWrapperElement().scrollWrapperElement?.clientHeight ?? 0,
          totalNumberOfRows,
        });

      const pagesInOverscanWindow = getContiguousIncrementalValues(
        overscanPageAtBottom - overscanPageAtTop,
        overscanPageAtTop,
      );

      const pagesToFetch = shouldRefetchLoadedPages
        ? pagesInOverscanWindow
        : getPagesWithUnloadedRows({
            pages: pagesInOverscanWindow,
            recordIdsByRowIndex: store.get(
              recordIdsByGroupCallbackState(NO_RECORD_GROUP_FAMILY_KEY),
            ),
            totalNumberOfRows,
          });

      const firstPageToFetch = pagesToFetch.at(0);
      const lastPageToFetch = pagesToFetch.at(-1);

      if (!isDefined(firstPageToFetch) || !isDefined(lastPageToFetch)) {
        return;
      }

      const startingRowIndexToFetch =
        firstPageToFetch * TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

      const numberOfRecordsToFetch =
        (lastPageToFetch - firstPageToFetch + 1) *
        TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

      store.set(numberOfPendingPageFetchesCallbackState, (count) => count + 1);

      try {
        const { records } = await findManyRecordsLazyWithOffset(
          numberOfRecordsToFetch,
          startingRowIndexToFetch,
        );

        if (!isDefined(records)) {
          return;
        }

        for (
          let sliceStart = 0;
          sliceStart < records.length;
          sliceStart += PAGING_FOR_UI_UPDATE
        ) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, TIME_BETWEEN_UI_BATCH_UPDATE),
          );

          const recordsSlice = records.slice(
            sliceStart,
            sliceStart + PAGING_FOR_UI_UPDATE,
          );

          upsertRecordsInStore({ partialRecords: recordsSlice });

          loadRecordsAtRowIndexes({
            records: recordsSlice,
            startingRowIndex: startingRowIndexToFetch + sliceStart,
          });
        }
      } finally {
        store.set(
          numberOfPendingPageFetchesCallbackState,
          (count) => count - 1,
        );
      }
    },
    [
      findManyRecordsLazyWithOffset,
      lastScrollPositionCallbackState,
      loadRecordsAtRowIndexes,
      lowDetailsActivatedCallbackState,
      numberOfPendingPageFetchesCallbackState,
      recordIdsByGroupCallbackState,
      getScrollWrapperElement,
      store,
      totalNumberOfRowsCallbackState,
      upsertRecordsInStore,
    ],
  );

  const triggerFetchPages = useDebouncedCallback(
    triggerFetchPagesWithoutDebounce,
    TIME_BETWEEN_TWO_REQUESTS,
    { maxWait: 2000 },
  );

  return { triggerFetchPages, triggerFetchPagesWithoutDebounce };
};
