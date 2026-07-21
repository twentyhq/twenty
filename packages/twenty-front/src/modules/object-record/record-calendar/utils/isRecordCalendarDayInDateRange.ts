import { Temporal } from 'temporal-polyfill';

type IsRecordCalendarDayInDateRangeArgs = {
  day: Temporal.PlainDate;
  endDate?: Temporal.PlainDate | null;
  startDate: Temporal.PlainDate;
};

export const isRecordCalendarDayInDateRange = ({
  day,
  endDate,
  startDate,
}: IsRecordCalendarDayInDateRangeArgs) => {
  const validEndDate =
    endDate !== null &&
    endDate !== undefined &&
    Temporal.PlainDate.compare(endDate, startDate) >= 0
      ? endDate
      : startDate;

  return (
    Temporal.PlainDate.compare(day, startDate) >= 0 &&
    Temporal.PlainDate.compare(day, validEndDate) <= 0
  );
};
