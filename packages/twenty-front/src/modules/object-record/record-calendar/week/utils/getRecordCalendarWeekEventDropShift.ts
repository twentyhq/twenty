// Time of day must be read from the wall clock (what a clock on the wall
// shows), not from elapsed time since midnight. These two normally match,
// but disagree on Daylight Saving Time transition days:
//
//   - Spring forward: at 02:00 the clock jumps to 03:00, so that day has
//     only 23 hours. When the wall clock reads 10:00, only 9 real hours
//     have elapsed since midnight.
//   - Fall back: at 02:00 the clock jumps to 01:00, so that day has 25
//     hours. When the wall clock reads 10:00, 11 real hours have elapsed.
//
// The delta is applied to wall-clock plain times downstream, so measuring
// it in elapsed time would shift the other selected records by an extra
// hour on those days. Using toPlainTime() keeps this on the wall clock.

import { Temporal } from 'temporal-polyfill';

type GetRecordCalendarWeekEventDropShiftArgs = {
  destinationDay: Temporal.PlainDate;
  destinationMinutes: number;
  startDateTime: unknown;
  timeZone: string;
};

export const getRecordCalendarWeekEventDropShift = ({
  destinationDay,
  destinationMinutes,
  startDateTime,
  timeZone,
}: GetRecordCalendarWeekEventDropShiftArgs) => {
  if (typeof startDateTime !== 'string') {
    return null;
  }

  try {
    const startZoned =
      Temporal.Instant.from(startDateTime).toZonedDateTimeISO(timeZone);

    const dayOffset = startZoned.toPlainDate().until(destinationDay).days;

    const destinationTimeOfDayNanoseconds = BigInt(
      Math.round(destinationMinutes * 60 * 1_000_000_000),
    );
    const originalTimeOfDayNanoseconds = BigInt(
      Temporal.PlainTime.from('00:00')
        .until(startZoned.toPlainTime())
        .total({ unit: 'nanoseconds' }),
    );

    return {
      dayOffset,
      timeOfDayDeltaNanoseconds:
        destinationTimeOfDayNanoseconds - originalTimeOfDayNanoseconds,
    };
  } catch {
    return null;
  }
};
