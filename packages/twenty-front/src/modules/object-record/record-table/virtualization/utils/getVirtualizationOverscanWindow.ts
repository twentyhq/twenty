import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_VIRTUALIZATION_NUMBER_OF_OVERSCAN_PAGES } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfOverscanPages';
import { TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfRecordsPerPage';

export const getVirtualizationOverscanWindow = ({
  scrollPosition,
  scrollWrapperHeight,
  totalNumberOfRows,
}: {
  scrollPosition: number;
  scrollWrapperHeight: number;
  totalNumberOfRows: number;
}) => {
  const numberOfRowsDisplayedInTable = Math.min(
    Math.floor(scrollWrapperHeight / (RECORD_TABLE_ROW_HEIGHT + 1)),
    40,
  );

  const halfNumberOfRowsVisible = Math.floor(numberOfRowsDisplayedInTable / 2);

  const rowIndexAtTheMiddleOfTheTable =
    Math.floor(scrollPosition / (RECORD_TABLE_ROW_HEIGHT + 1)) +
    halfNumberOfRowsVisible;

  const pageForRowIndex = Math.ceil(
    rowIndexAtTheMiddleOfTheTable /
      TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE,
  );

  const maxPage = Math.ceil(
    totalNumberOfRows / TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE,
  );

  const overscanPageAtTop = Math.max(
    0,
    pageForRowIndex - TABLE_VIRTUALIZATION_NUMBER_OF_OVERSCAN_PAGES,
  );

  const overscanPageAtBottom = Math.min(
    maxPage,
    pageForRowIndex + TABLE_VIRTUALIZATION_NUMBER_OF_OVERSCAN_PAGES,
  );

  const firstRowIndexInOverscanWindow =
    overscanPageAtTop * TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

  const lastRowIndexInOverscanWindow =
    overscanPageAtBottom * TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

  return {
    overscanPageAtTop,
    overscanPageAtBottom,
    firstRowIndexInOverscanWindow,
    lastRowIndexInOverscanWindow,
  };
};
