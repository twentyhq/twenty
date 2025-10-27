import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { zonedTimeToUtc } from 'date-fns-tz';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';

export const useGetDateFilterDisplayValue = () => {
  const { userTimezone } = useUserTimezone();

  const getDateFilterDisplayValue = (
    value: Date,
    fieldType: FilterableAndTSVectorFieldType,
  ) => {
    if (fieldType === 'DATE_TIME') {
      const displayValue = zonedTimeToUtc(value, userTimezone);

      return { displayValue };
    } else {
      const displayValue = value.toLocaleDateString();

      return { displayValue };
    }
  };

  return {
    getDateFilterDisplayValue,
  };
};
