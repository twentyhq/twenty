import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { getTimezoneAbbreviationForZonedDateTime } from '@/ui/input/components/internal/date/utils/getTimeZoneAbbreviationForZonedDateTime';
import { Temporal } from 'temporal-polyfill';

export const useTimeZoneAbbreviationForNowInUserTimeZone = () => {
  const { userTimezone } = useUserTimezone();

  const nowZonedDateTime = Temporal.Now.zonedDateTimeISO(userTimezone);

  const userTimeZoneAbbreviation =
    getTimezoneAbbreviationForZonedDateTime(nowZonedDateTime);

  return { userTimeZoneAbbreviation };
};
