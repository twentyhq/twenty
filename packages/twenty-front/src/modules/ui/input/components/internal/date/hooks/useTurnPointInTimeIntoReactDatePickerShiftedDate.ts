import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { TZDate } from '@date-fns/tz';

export const useTurnPointInTimeIntoReactDatePickerShiftedDate = () => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { userTimezone } = useUserTimezone();

  // TODO: replace here with shiftPointInTimeToFromTimezoneDifference
  const turnPointInTimeIntoReactDatePickerShiftedDate = (pointInTime: Date) => {
    const dateSure = new TZDate(pointInTime).withTimeZone(userTimezone);

    const shiftedDate = new TZDate(
      dateSure.getFullYear(),
      dateSure.getMonth(),
      dateSure.getDate(),
      dateSure.getHours(),
      dateSure.getMinutes(),
      dateSure.getSeconds(),
      systemTimeZone,
    );

    return shiftedDate;
  };

  return {
    turnPointInTimeIntoReactDatePickerShiftedDate,
  };
};
