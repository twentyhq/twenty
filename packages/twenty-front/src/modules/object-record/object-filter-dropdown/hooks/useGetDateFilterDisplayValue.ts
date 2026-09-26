import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useUserDateFormat } from '@/ui/input/components/internal/date/hooks/useUserDateFormat';
import { type Temporal } from 'temporal-polyfill';
import { formatZonedDateTimeDatePart } from '~/utils/dates/formatZonedDateTimeDatePart';

export const useGetDateFilterDisplayValue = () => {
  const { userDateFormat } = useUserDateFormat();
  const { calendarSystem } = useDateTimeFormat();

  const getDateFilterDisplayValue = (zonedDateTime: Temporal.ZonedDateTime) => {
    const displayValue = `${formatZonedDateTimeDatePart(zonedDateTime, userDateFormat, calendarSystem)}`;

    return { displayValue };
  };

  return {
    getDateFilterDisplayValue,
  };
};
