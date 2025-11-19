import { getEndUnitOfDateTime } from 'twenty-shared/utils';

type QuarterDateRange = {
  rangeStartDate: Date;
  rangeEndDate: Date;
};

export const calculateQuarterDateRange = (
  parsedBucketDate: Date,
): QuarterDateRange => {
  const quarterStartMonthIndex =
    Math.floor(parsedBucketDate.getMonth() / 3) * 3;
  const rangeStartDate = new Date(
    parsedBucketDate.getFullYear(),
    quarterStartMonthIndex,
    1,
  );

  const quarterFinalMonthIndex = quarterStartMonthIndex + 2;
  const rangeEndDate = getEndUnitOfDateTime(
    new Date(parsedBucketDate.getFullYear(), quarterFinalMonthIndex, 1),
    'MONTH',
  );

  return { rangeStartDate, rangeEndDate };
};
