import { Temporal } from 'temporal-polyfill';

type GetShiftedRecordCalendarDateTimeArgs = {
  dayOffset: number;
  startDateTime?: unknown;
  timeZone: string;
};

export type ShiftedRecordCalendarDateTime = {
  startDateTime: string;
};

export const getShiftedRecordCalendarDateTime = ({
  dayOffset,
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

    return {
      startDateTime: shiftedStartInstant.toString(),
    };
  } catch {
    return null;
  }
};
