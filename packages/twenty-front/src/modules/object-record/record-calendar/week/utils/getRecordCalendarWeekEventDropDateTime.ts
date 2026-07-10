import { Temporal } from 'temporal-polyfill';

type GetRecordCalendarWeekEventDropDateTimeArgs = {
  destinationDay: Temporal.PlainDate;
  destinationMinutes: number;
  endDateTime?: unknown;
  startDateTime?: unknown;
  timeZone: string;
};

export const getRecordCalendarWeekEventDropDateTime = ({
  destinationDay,
  destinationMinutes,
  endDateTime,
  startDateTime,
  timeZone,
}: GetRecordCalendarWeekEventDropDateTimeArgs) => {
  if (typeof startDateTime !== 'string') {
    return null;
  }

  try {
    const currentStartInstant = Temporal.Instant.from(startDateTime);
    const shiftedStartInstant = destinationDay
      .toZonedDateTime({
        timeZone,
        plainTime: Temporal.PlainTime.from('00:00').add({
          nanoseconds: Math.round(destinationMinutes * 60 * 1_000_000_000),
        }),
      })
      .toInstant();
    let shiftedEndDateTime: string | undefined;

    if (typeof endDateTime === 'string') {
      try {
        const currentEndInstant = Temporal.Instant.from(endDateTime);

        if (
          Temporal.Instant.compare(currentEndInstant, currentStartInstant) > 0
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
