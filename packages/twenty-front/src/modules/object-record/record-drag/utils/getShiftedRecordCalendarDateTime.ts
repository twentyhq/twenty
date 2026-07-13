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

    let shiftedEndDateTime: string | undefined;

    if (typeof endDateTime === 'string') {
      try {
        const currentEndInstant = Temporal.Instant.from(endDateTime);

        if (
          Temporal.Instant.compare(currentEndInstant, currentStartInstant) >= 0
        ) {
          shiftedEndDateTime = Temporal.Instant.fromEpochNanoseconds(
            shiftedStartInstant.epochNanoseconds +
              (currentEndInstant.epochNanoseconds -
                currentStartInstant.epochNanoseconds),
          ).toString();
        }
      } catch {
        shiftedEndDateTime = undefined;
      }
    }

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
