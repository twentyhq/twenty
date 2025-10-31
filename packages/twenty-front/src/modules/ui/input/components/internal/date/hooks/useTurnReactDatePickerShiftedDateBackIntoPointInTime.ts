import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { TZDate } from '@date-fns/tz';

export const useTurnReactDatePickerShiftedDateBackIntoPointInTime = () => {
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { userTimezone } = useUserTimezone();

  // TODO: replace here with shiftPointInTimeToFromTimezoneDifference
  const turnReactDatePickerShiftedDateBackIntoPointInTime = (
    reactDatePickerShiftedDate: Date,
  ) => {
    const dateSure = new TZDate(reactDatePickerShiftedDate).withTimeZone(
      systemTimeZone,
    );

    const dateTz = new TZDate(
      dateSure.getFullYear(),
      dateSure.getMonth(),
      dateSure.getDate(),
      dateSure.getHours(),
      dateSure.getMinutes(),
      dateSure.getSeconds(),
      userTimezone,
    );

    return dateTz;
  };

  return {
    turnReactDatePickerShiftedDateBackIntoPointInTime,
  };
};
