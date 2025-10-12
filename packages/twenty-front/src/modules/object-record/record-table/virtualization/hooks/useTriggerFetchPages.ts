import { useLazyFindManyRecordsWithOffset } from '@/object-record/hooks/useLazyFindManyRecordsWithOffset';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';

import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { getContiguousIncrementalValues, isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

// TODO: Those parameters allow the UI to not freeze while it can take time to fetch data.
// We should work on two additional optimization rounds :
//   - A row take too much time to render
//   - Requests are too eagerly loading relationships.
const TIME_BETWEEN_UI_BATCH_UPDATE = 25;
const PAGING_FOR_UI_UPDATE = 10;
const TIME_BETWEEN_TWO_REQUETS = 25;

const DATA_PAGE_SIZE = 10;
const DATA_PAGE_OVERSCAN = 3;

export const useTriggerFetchPages = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();

  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );

  const dataPagesLoadedCallbackState = useRecoilComponentCallbackState(
    dataPagesLoadedComponentState,
  );

  const { findManyRecordsLazyWithOffset } = useLazyFindManyRecordsWithOffset({
    objectNameSingular,
  });

  const lowDetailsActivatedCallbackState = useRecoilComponentCallbackState(
    lowDetailsActivatedComponentState,
  );

  const triggerFetchPagesWithoutDebounce = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const lowDetailsActivated = getSnapshotValue(
          snapshot,
          lowDetailsActivatedCallbackState,
        );

        if (lowDetailsActivated) {
          return;
        }

        const tableScrollWrapperHeight =
          scrollWrapperHTMLElement?.clientHeight ?? 0;

        const lastScrollPosition = getSnapshotValue(
          snapshot,
          lastScrollPositionCallbackState,
        );

        const numberOfRowsDisplayedInTable = Math.min(
          Math.floor(tableScrollWrapperHeight / (RECORD_TABLE_ROW_HEIGHT + 1)),
          30,
        );

        const halfNumberOfRowsVisible = Math.floor(
          numberOfRowsDisplayedInTable / 2,
        );

        const realIndexAtTheMiddleOfTheTable =
          Math.floor(lastScrollPosition / (RECORD_TABLE_ROW_HEIGHT + 1)) +
          halfNumberOfRowsVisible;

        const pageForRealIndex = Math.ceil(
          realIndexAtTheMiddleOfTheTable / DATA_PAGE_SIZE,
        );

        const totalNumberOfRealIndices =
          getSnapshotValue(
            snapshot,
            totalNumberOfRecordsToVirtualizeCallbackState,
          ) ?? 0;

        const maxPage = Math.ceil(totalNumberOfRealIndices / DATA_PAGE_SIZE);

        const overscanPageAtTop = Math.max(
          0,
          pageForRealIndex - DATA_PAGE_OVERSCAN,
        );

        const overscanPageAtBottom = Math.min(
          maxPage,
          pageForRealIndex + DATA_PAGE_OVERSCAN,
        );

        const pagesAlreadyLoaded = getSnapshotValue(
          snapshot,
          dataPagesLoadedCallbackState,
        );

        const numberOfPages = overscanPageAtBottom - overscanPageAtTop;

        const pagesToFetchInitial = getContiguousIncrementalValues(
          numberOfPages,
          overscanPageAtTop,
        );

        const pagesToFetch = pagesToFetchInitial.filter(
          (pageNumber) => !pagesAlreadyLoaded.includes(pageNumber),
        );

        if (pagesToFetch.length === 0) {
          return;
        }

        let pagesAreContiguous = true;

        for (const [index, pageNumber] of pagesToFetch.entries()) {
          const isLastElementOfArray = index === pagesToFetch.length - 1;

          if (isLastElementOfArray) {
            continue;
          }

          const nextPageNumberIsNotContiguous =
            pagesToFetch.at(index + 1) !== pageNumber + 1;

          if (nextPageNumberIsNotContiguous) {
            pagesAreContiguous = false;
            break;
          }
        }

        if (pagesAreContiguous) {
          const startingRealIndexToFetch =
            (pagesToFetch.at(0) ?? 0) * DATA_PAGE_SIZE;

          const endingRealIndexToFetch =
            (pagesToFetch.at(-1) ?? 0) * DATA_PAGE_SIZE + DATA_PAGE_SIZE;

          const numberOfRecordsToFetch =
            endingRealIndexToFetch - startingRealIndexToFetch;

          if (numberOfRecordsToFetch > 0) {
            const fetchResult = await findManyRecordsLazyWithOffset(
              numberOfRecordsToFetch,
              startingRealIndexToFetch,
            );

            const records = fetchResult.records;

            if (isDefined(records)) {
              const pagingForUIUpdate = PAGING_FOR_UI_UPDATE;

              const pages = Math.ceil(records.length / pagingForUIUpdate);

              for (let page = 0; page < pages; page++) {
                await new Promise<void>((res) =>
                  setTimeout(() => res(), TIME_BETWEEN_UI_BATCH_UPDATE),
                );

                const startingRealIndexInThisUIPage =
                  startingRealIndexToFetch + page * pagingForUIUpdate;

                const startingSliceIndexInThisPage = page * pagingForUIUpdate;
                const endingSliceIndexInThisPage =
                  startingSliceIndexInThisPage + pagingForUIUpdate;

                const recordsSlice = records.slice(
                  startingSliceIndexInThisPage,
                  endingSliceIndexInThisPage,
                );

                loadRecordsToVirtualRows({
                  records: recordsSlice,
                  startingRealIndex: startingRealIndexInThisUIPage,
                });

                upsertRecordsInStore(recordsSlice);
              }
            }

            set(dataPagesLoadedCallbackState, (currentLoadedPages) =>
              currentLoadedPages.concat(pagesToFetch).toSorted(),
            );
          }
        } else {
          // TODO fetch page by page (will be optmized later)
        }
      },
    [
      dataPagesLoadedCallbackState,
      findManyRecordsLazyWithOffset,
      totalNumberOfRecordsToVirtualizeCallbackState,
      loadRecordsToVirtualRows,
      upsertRecordsInStore,
      lastScrollPositionCallbackState,
      scrollWrapperHTMLElement,
      lowDetailsActivatedCallbackState,
    ],
  );

  const triggerFetchPages = useDebouncedCallback(
    triggerFetchPagesWithoutDebounce,
    TIME_BETWEEN_TWO_REQUETS,
    {
      maxWait: 2000,
    },
  );

  return {
    triggerFetchPages,
    triggerFetchPagesWithoutDebounce,
  };
};
