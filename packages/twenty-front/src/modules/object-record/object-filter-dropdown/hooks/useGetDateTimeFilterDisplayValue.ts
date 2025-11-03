import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/format-preferences/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/format-preferences/getTimeFormatFromWorkspaceTimeFormat';
import { useUserDateFormat } from '@/ui/input/components/internal/date/hooks/useUserDateFormat';
import { useUserTimeFormat } from '@/ui/input/components/internal/date/hooks/useUserTimeFormat';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { format } from 'date-fns';
import { shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone } from 'twenty-shared/utils';

export const useGetDateTimeFilterDisplayValue = () => {
  const {
    userTimezone,
    isSystemTimezone,
    getTimezoneAbbreviationForPointInTime,
  } = useUserTimezone();
  const { userDateFormat } = useUserDateFormat();
  const { userTimeFormat } = useUserTimeFormat();

  const getDateTimeFilterDisplayValue = (correctPointInTime: Date) => {
    const shiftedDate =
      shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone(
        correctPointInTime,
        userTimezone,
        'sub',
      );

    const dateFormatString =
      getDateFormatFromWorkspaceDateFormat(userDateFormat);

    const timeFormatString =
      getTimeFormatFromWorkspaceTimeFormat(userTimeFormat);

    const formatToUse = `${dateFormatString} ${timeFormatString}`;

    const timezoneSuffix = !isSystemTimezone
      ? ` (${getTimezoneAbbreviationForPointInTime(shiftedDate)})`
      : '';

    const displayValue = `${format(shiftedDate, formatToUse)}${timezoneSuffix}`;

    return {
      correctPointInTime,
      displayValue,
    };
  };

  return {
    getDateTimeFilterDisplayValue,
  };
};
