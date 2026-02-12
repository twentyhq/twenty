import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_VIRTUALIZATION_NUMBER_OF_OVERSCAN_PAGES } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfOverscanPages';
import { TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfRecordsPerPage';

export const getVirtualizationOverscanWindow = (
  scrollPosition: number,
  scrollWrapperHeight: number,
  totalNumberOfRecordsToVirtualize: number,
) => {
  const numberOfRowsDisplayedInTable = Math.min(
    Math.floor(scrollWrapperHeight / (RECORD_TABLE_ROW_HEIGHT + 1)),
    30,
  );

  const halfNumberOfRowsVisible = Math.floor(numberOfRowsDisplayedInTable / 2);

  const realIndexAtTheMiddleOfTheTable =
    Math.floor(scrollPosition / (RECORD_TABLE_ROW_HEIGHT + 1)) +
    halfNumberOfRowsVisible;

  const pageForRealIndex = Math.ceil(
    realIndexAtTheMiddleOfTheTable /
      TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE,
  );

  const maxPage = Math.ceil(
    totalNumberOfRecordsToVirtualize /
      TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE,
  );

  const overscanPageAtTop = Math.max(
    0,
    pageForRealIndex - TABLE_VIRTUALIZATION_NUMBER_OF_OVERSCAN_PAGES,
  );

  const overscanPageAtBottom = Math.min(
    maxPage,
    pageForRealIndex + TABLE_VIRTUALIZATION_NUMBER_OF_OVERSCAN_PAGES,
  );

  const firstRealIndexInOverscanWindow =
    overscanPageAtTop * TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

  const lastRealIndexInOverscanWindow =
    overscanPageAtBottom * TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

  return {
    overscanPageAtTop,
    overscanPageAtBottom,
    firstRealIndexInOverscanWindow,
    lastRealIndexInOverscanWindow,
  };
};
