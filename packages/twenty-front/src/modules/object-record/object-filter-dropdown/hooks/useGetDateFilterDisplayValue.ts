import { useUserDateFormat } from '@/ui/input/components/internal/date/hooks/useUserDateFormat';
import { type Temporal } from 'temporal-polyfill';
import { formatZonedDateTimeDatePart } from '~/utils/dates/formatZonedDateTimeDatePart';

export const useGetDateFilterDisplayValue = () => {
  const { userDateFormat } = useUserDateFormat();

  const getDateFilterDisplayValue = (zonedDateTime: Temporal.ZonedDateTime) => {
    const displayValue = `${formatZonedDateTimeDatePart(zonedDateTime, userDateFormat)}`;

    return { displayValue };
  };

  return {
    getDateFilterDisplayValue,
  };
};
