import { getShiftedRecordCalendarEndDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarEndDateTime';
import { Temporal } from 'temporal-polyfill';

type GetShiftedRecordCalendarDateTimeArgs = {
  destinationDay: Temporal.PlainDate;
  endDateTime?: unknown;
  sourceDay: Temporal.PlainDate;
  startDateTime?: unknown;
  timeZone: string;
};

export type ShiftedRecordCalendarDateTime = {
  endDateTime?: string;
  startDateTime: string;
};

export const getShiftedRecordCalendarDateTime = ({
  destinationDay,
  endDateTime,
  sourceDay,
  startDateTime,
  timeZone,
}: GetShiftedRecordCalendarDateTimeArgs): ShiftedRecordCalendarDateTime | null => {
  if (typeof startDateTime !== 'string') {
    return null;
  }

  try {
    const currentStartInstant = Temporal.Instant.from(startDateTime);
    const dayOffset = sourceDay.until(destinationDay).days;
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
