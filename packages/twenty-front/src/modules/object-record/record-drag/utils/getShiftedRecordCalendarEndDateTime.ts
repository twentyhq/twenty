import { Temporal } from 'temporal-polyfill';

type GetShiftedRecordCalendarEndDateTimeArgs = {
  endDateTime?: unknown;
  originalStartInstant: Temporal.Instant;
  shiftedStartInstant: Temporal.Instant;
};

export const getShiftedRecordCalendarEndDateTime = ({
  endDateTime,
  originalStartInstant,
  shiftedStartInstant,
}: GetShiftedRecordCalendarEndDateTimeArgs): string | undefined => {
  if (typeof endDateTime !== 'string') {
    return undefined;
  }

  try {
    const originalEndInstant = Temporal.Instant.from(endDateTime);

    if (
      Temporal.Instant.compare(originalEndInstant, originalStartInstant) < 0
    ) {
      return undefined;
    }

    return Temporal.Instant.fromEpochNanoseconds(
      shiftedStartInstant.epochNanoseconds +
        (originalEndInstant.epochNanoseconds -
          originalStartInstant.epochNanoseconds),
    ).toString();
  } catch {
    return undefined;
  }
};
