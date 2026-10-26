import { isDefined } from 'twenty-shared/utils';

import { TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE } from '@/object-record/record-table/virtualization/constants/TableVirtualizationNumberOfRecordsPerPage';

export const getRecordTableRowExtent = ({
  totalCount,
  offset = 0,
  numberOfRecords,
  hasNextPage,
  recordLimit,
  previousExtent = 0,
}: {
  totalCount?: number;
  offset?: number;
  numberOfRecords: number;
  hasNextPage: boolean;
  recordLimit?: number;
  previousExtent?: number;
}) => {
  const loadedEnd = offset + numberOfRecords;
  const isEndKnown = !hasNextPage && (numberOfRecords > 0 || offset === 0);
  const isTotalCountKnown = isDefined(totalCount) || isEndKnown;
  const unboundedExtent =
    totalCount ??
    (isEndKnown
      ? loadedEnd
      : Math.max(
          previousExtent,
          loadedEnd + TABLE_VIRTUALIZATION_NUMBER_OF_RECORDS_PER_PAGE,
        ));

  return {
    totalNumberOfRows: isDefined(recordLimit)
      ? Math.min(unboundedExtent, recordLimit)
      : unboundedExtent,
    isTotalCountKnown:
      isTotalCountKnown || (isDefined(recordLimit) && loadedEnd >= recordLimit),
  };
};
