import { TZDate } from '@date-fns/tz';
import { getEndUnitOfDateTime } from 'twenty-shared/utils';

type QuarterDateRange = {
  rangeStartDate: Date;
  rangeEndDate: Date;
};

export const calculateQuarterDateRange = (
  parsedBucketDate: Date,
  timezone?: string,
): QuarterDateRange => {
  const quarterStartMonthIndex =
    Math.floor(parsedBucketDate.getMonth() / 3) * 3;
  const rangeStartDate = timezone
    ? new TZDate(
        parsedBucketDate.getFullYear(),
        quarterStartMonthIndex,
        1,
        timezone,
      )
    : new Date(parsedBucketDate.getFullYear(), quarterStartMonthIndex, 1);

  const quarterFinalMonthIndex = quarterStartMonthIndex + 2;
  const rangeEndDate = getEndUnitOfDateTime(
    timezone
      ? new TZDate(
          parsedBucketDate.getFullYear(),
          quarterFinalMonthIndex,
          1,
          timezone,
        )
      : new Date(parsedBucketDate.getFullYear(), quarterFinalMonthIndex, 1),
    'MONTH',
  );

  return { rangeStartDate, rangeEndDate };
};
