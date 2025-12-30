import { Temporal } from 'temporal-polyfill';

export const useGetShiftedDateToCustomTimeZone = () => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const getShiftedDateToCustomTimeZone = (
    instantExpressedInSystemTimeZone: Date,
    timeZone: string,
  ) => {
    const correctZonedDateTime = Temporal.Instant.from(
      instantExpressedInSystemTimeZone.toISOString(),
    ).toZonedDateTimeISO(systemTimeZone);

    const plainDateTimeWithoutTimeZone = correctZonedDateTime.toPlainDateTime();

    const shiftedZonedDateTime =
      plainDateTimeWithoutTimeZone.toZonedDateTime(timeZone);

    const dateObjectShiftedToCustomTimeZone = new Date(
      shiftedZonedDateTime.toInstant().toString(),
    );

    return dateObjectShiftedToCustomTimeZone;
  };

  return {
    getShiftedDateToCustomTimeZone,
  };
};
