import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { zonedTimeToUtc } from 'date-fns-tz';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';

export const useGetDateFilterDefaultValue = () => {
  const { userTimezone } = useUserTimezone();

  const getDateFilterDefaultValue = (
    fieldType: FilterableAndTSVectorFieldType,
  ) => {
    if (fieldType === 'DATE_TIME') {
      const value = zonedTimeToUtc(new Date(), userTimezone);

      return { value };
    } else {
      const value = zonedTimeToUtc(new Date(), userTimezone);

      return { value };
    }
  };

  return {
    getDateFilterDefaultValue,
  };
};
