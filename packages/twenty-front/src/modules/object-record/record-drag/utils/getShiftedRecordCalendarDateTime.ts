import { getShiftedRecordCalendarEndDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarEndDateTime';
import { Temporal } from 'temporal-polyfill';

type GetShiftedRecordCalendarDateTimeArgs = {
  dayOffset: number;
  endDateTime?: unknown;
  startDateTime?: unknown;
  timeZone: string;
};

export type ShiftedRecordCalendarDateTime = {
  endDateTime?: string;
  startDateTime: string;
};

export const getShiftedRecordCalendarDateTime = ({
  dayOffset,
  endDateTime,
  startDateTime,
  timeZone,
}: GetShiftedRecordCalendarDateTimeArgs): ShiftedRecordCalendarDateTime | null => {
  if (typeof startDateTime !== 'string') {
    return null;
  }

  try {
    const currentStartInstant = Temporal.Instant.from(startDateTime);
    const shiftedStartInstant = currentStartInstant
      .toZonedDateTimeISO(timeZone)
      .add({ days: dayOffset })
      .toInstant();

    const shiftedEndDateTime = getShiftedRecordCalendarEndDateTime({
      endDateTime,
      originalStartInstant: currentStartInstant,
      shiftedStartInstant,
    });

    return {
      startDateTime: shiftedStartInstant.toString(),
      ...(shiftedEndDateTime !== undefined && {
        endDateTime: shiftedEndDateTime,
      }),
    };
  } catch {
    return null;
  }
};
