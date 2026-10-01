import { isDefined } from 'twenty-shared/utils';

// A count past its limit only says more records exist, so the table treats it
// as a lower bound and counts further as people scroll toward it
export const getTotalNumberOfRecordsToVirtualize = ({
  totalCount,
  totalCountLimit,
  recordLimit,
}: {
  totalCount: number;
  totalCountLimit: number;
  recordLimit?: number;
}) => {
  const isClippedByRecordLimit =
    isDefined(recordLimit) && recordLimit <= totalCount;

  return {
    totalNumberOfRecordsToVirtualize: isClippedByRecordLimit
      ? recordLimit
      : totalCount,
    isLowerBound: !isClippedByRecordLimit && totalCount > totalCountLimit,
  };
};
