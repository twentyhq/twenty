import { Temporal } from 'temporal-polyfill';

type GetShiftedRecordCalendarEndDateArgs = {
  dayOffset: number;
  endDate?: unknown;
  originalStartDate: Temporal.PlainDate;
};

export const getShiftedRecordCalendarEndDate = ({
  dayOffset,
  endDate,
  originalStartDate,
}: GetShiftedRecordCalendarEndDateArgs): string | undefined => {
  if (typeof endDate !== 'string') {
    return undefined;
  }

  try {
    const originalEndDate = Temporal.PlainDate.from(endDate);

    if (Temporal.PlainDate.compare(originalEndDate, originalStartDate) < 0) {
      return undefined;
    }

    return originalEndDate.add({ days: dayOffset }).toString();
  } catch {
    return undefined;
  }
};