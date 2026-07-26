import { getShiftedRecordCalendarEndDate } from '@/object-record/record-drag/utils/getShiftedRecordCalendarEndDate';
import { type Temporal } from 'temporal-polyfill';

type GetShiftedRecordCalendarDateArgs = {
  currentStartDate: Temporal.PlainDate;
  dayOffset: number;
  endDate?: unknown;
  startDate?: unknown;
};

export type ShiftedRecordCalendarDate = {
  endDate?: string;
  startDate: string;
};

export const getShiftedRecordCalendarDate = ({
  currentStartDate,
  dayOffset,
  endDate,
  startDate,
}: GetShiftedRecordCalendarDateArgs): ShiftedRecordCalendarDate | null => {
  if (typeof startDate !== 'string') {
    return null;
  }

  try {
    const shiftedStartDate = currentStartDate.add({ days: dayOffset });

    const shiftedEndDate = getShiftedRecordCalendarEndDate({
      dayOffset,
      endDate,
      originalStartDate: currentStartDate,
    });

    return {
      startDate: shiftedStartDate.toString(),
      ...(shiftedEndDate !== undefined && {
        endDate: shiftedEndDate,
      }),
    };
  } catch {
    return null;
  }
};
