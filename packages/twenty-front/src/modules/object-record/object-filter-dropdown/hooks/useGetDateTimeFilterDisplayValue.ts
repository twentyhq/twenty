import { useUserDateFormat } from '@/ui/input/components/internal/date/hooks/useUserDateFormat';
import { useUserTimeFormat } from '@/ui/input/components/internal/date/hooks/useUserTimeFormat';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { getTimezoneAbbreviationForZonedDateTime } from '@/ui/input/components/internal/date/utils/getTimeZoneAbbreviationForZonedDateTime';
import { type Temporal } from 'temporal-polyfill';
import { formatZonedDateTimeDatePart } from '~/utils/dates/formatZonedDateTimeDatePart';
import { formatZonedDateTimeTimePart } from '~/utils/dates/formatZonedDateTimeTimePart';

export const useGetDateTimeFilterDisplayValue = () => {
  const { isSystemTimezone } = useUserTimezone();

  const { userDateFormat } = useUserDateFormat();
  const { userTimeFormat } = useUserTimeFormat();

  const getDateTimeFilterDisplayValue = (
    referenceZonedDateTime: Temporal.ZonedDateTime,
  ) => {
    const timezoneSuffix = !isSystemTimezone
      ? ` (${getTimezoneAbbreviationForZonedDateTime(referenceZonedDateTime)})`
      : '';

    const displayValue = `${formatZonedDateTimeDatePart(referenceZonedDateTime, userDateFormat)} ${formatZonedDateTimeTimePart(referenceZonedDateTime, userTimeFormat)}${timezoneSuffix}`;

    return { displayValue };
  };

  return {
    getDateTimeFilterDisplayValue,
  };
};
