import { TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfRecordsPerPage';

export const getDataPagesLoadedFromLoadingStatus = ({
  dataLoadingStatusByRealIndex,
  totalNumberOfRecordsToVirtualize,
}: {
  dataLoadingStatusByRealIndex: Map<number, 'loaded' | 'not-loaded'>;
  totalNumberOfRecordsToVirtualize: number;
}): number[] => {
  const candidatePages = new Set<number>();

  for (const [realIndex, status] of dataLoadingStatusByRealIndex) {
    if (status === 'loaded') {
      candidatePages.add(
        Math.floor(realIndex / TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE),
      );
    }
  }

  const loadedPages: number[] = [];

  for (const page of candidatePages) {
    const firstRealIndex =
      page * TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

    const lastRealIndex =
      Math.min(
        firstRealIndex + TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE,
        totalNumberOfRecordsToVirtualize,
      ) - 1;

    let isPageLoaded = lastRealIndex >= firstRealIndex;

    for (
      let realIndex = firstRealIndex;
      realIndex <= lastRealIndex;
      realIndex++
    ) {
      if (dataLoadingStatusByRealIndex.get(realIndex) !== 'loaded') {
        isPageLoaded = false;
        break;
      }
    }

    if (isPageLoaded) {
      loadedPages.push(page);
    }
  }

  return loadedPages.toSorted((pageA, pageB) => pageA - pageB);
};
