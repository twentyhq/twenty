import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { Temporal } from 'temporal-polyfill';

export const useGetShiftedDateToSystemTimeZone = () => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { userTimezone } = useUserTimezone();

  const getShiftedDateToSystemTimeZone = (
    instantShiftedInCustomTimeZone: Date,
    timeZone?: string,
  ) => {
    const zonedDateTimeInCustomTimeZone = Temporal.Instant.from(
      instantShiftedInCustomTimeZone.toISOString(),
    ).toZonedDateTimeISO(timeZone ?? userTimezone);

    const plainDateTimeWithoutTimeZone =
      zonedDateTimeInCustomTimeZone.toPlainDateTime();

    const zonedDateTimeShiftedToSystemTimeZone =
      plainDateTimeWithoutTimeZone.toZonedDateTime(systemTimeZone);

    const dateObjectShiftedToSystemTimeZone = new Date(
      zonedDateTimeShiftedToSystemTimeZone.toInstant().toString(),
    );

    return dateObjectShiftedToSystemTimeZone;
  };

  return {
    getShiftedDateToSystemTimeZone,
  };
};
