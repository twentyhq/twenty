import { getContiguousIncrementalValues, isDefined } from 'twenty-shared/utils';

import { TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfRecordsPerPage';

export const getPagesWithUnloadedRows = ({
  pages,
  recordIdsByRowIndex,
  totalNumberOfRows,
}: {
  pages: number[];
  recordIdsByRowIndex: string[];
  totalNumberOfRows: number;
}): number[] =>
  pages.filter((page) => {
    const firstRowIndex =
      page * TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE;

    const numberOfRowsInPage =
      Math.min(
        firstRowIndex + TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE,
        totalNumberOfRows,
      ) - firstRowIndex;

    return getContiguousIncrementalValues(
      Math.max(0, numberOfRowsInPage),
      firstRowIndex,
    ).some((rowIndex) => !isDefined(recordIdsByRowIndex[rowIndex]));
  });
