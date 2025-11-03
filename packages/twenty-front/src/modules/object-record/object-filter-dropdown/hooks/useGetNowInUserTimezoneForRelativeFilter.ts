import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';

export const useGetNowInUserTimezoneForRelativeFilter = () => {
  const { userTimezone } = useUserTimezone();

  const getNowInUserTimezoneForRelativeFilter = () => {
    const now = new Date();

    const nowInUserTimezone = new TZDate(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      userTimezone,
    );

    const dayAsStringInUserTimezone = format(
      nowInUserTimezone,
      DATE_TYPE_FORMAT,
    );

    return {
      nowInUserTimezone,
      dayAsStringInUserTimezone,
    };
  };

  return {
    getNowInUserTimezoneForRelativeFilter,
  };
};
