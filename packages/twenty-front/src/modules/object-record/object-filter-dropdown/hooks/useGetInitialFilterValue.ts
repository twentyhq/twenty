import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/format-preferences/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/format-preferences/getTimeFormatFromWorkspaceTimeFormat';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserDateFormat } from '@/ui/input/components/internal/date/hooks/useUserDateFormat';
import { useUserTimeFormat } from '@/ui/input/components/internal/date/hooks/useUserTimeFormat';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { TZDate } from '@date-fns/tz';
import { isNonEmptyString } from '@sniptt/guards';
import { format } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';

const activeDatePickerOperands = [
  RecordFilterOperand.IS_BEFORE,
  RecordFilterOperand.IS,
  RecordFilterOperand.IS_AFTER,
];

export const useGetInitialFilterValue = () => {
  const {
    userTimezone,
    isSystemTimezone,
    getTimezoneAbbreviationForPointInTime,
  } = useUserTimezone();
  const { userDateFormat } = useUserDateFormat();
  const { userTimeFormat } = useUserTimeFormat();

  const getInitialFilterValue = (
    newType: FilterableAndTSVectorFieldType,
    newOperand: RecordFilterOperand,
    alreadyExistingISODate?: string,
  ): Pick<RecordFilter, 'value' | 'displayValue'> | Record<string, never> => {
    switch (newType) {
      case 'DATE': {
        if (activeDatePickerOperands.includes(newOperand)) {
          const referenceDate = isNonEmptyString(alreadyExistingISODate)
            ? new Date(alreadyExistingISODate)
            : new Date();

          const shiftedDate = new TZDate(
            referenceDate.getFullYear(),
            referenceDate.getMonth(),
            referenceDate.getDate(),
            userTimezone,
          );

          const dateFormatString =
            getDateFormatFromWorkspaceDateFormat(userDateFormat);

          shiftedDate.setSeconds(0);
          shiftedDate.setMilliseconds(0);

          const value = format(shiftedDate, DATE_TYPE_FORMAT);
          const displayValue = format(shiftedDate, dateFormatString);

          return { value, displayValue };
        }

        break;
      }
      case 'DATE_TIME': {
        if (activeDatePickerOperands.includes(newOperand)) {
          const referenceDate = isNonEmptyString(alreadyExistingISODate)
            ? new Date(alreadyExistingISODate)
            : new Date();

          const shiftedDate = new TZDate(
            referenceDate.getFullYear(),
            referenceDate.getMonth(),
            referenceDate.getDate(),
            referenceDate.getHours(),
            referenceDate.getMinutes(),
            userTimezone,
          );

          shiftedDate.setSeconds(0);
          shiftedDate.setMilliseconds(0);

          const dateFormatString =
            getDateFormatFromWorkspaceDateFormat(userDateFormat);

          const timeFormatString =
            getTimeFormatFromWorkspaceTimeFormat(userTimeFormat);

          const formatToUse = `${dateFormatString} ${timeFormatString}`;

          const timezoneSuffix = !isSystemTimezone
            ? ` (${getTimezoneAbbreviationForPointInTime(shiftedDate)})`
            : '';

          const value = shiftedDate.toISOString();
          const displayValue = `${format(shiftedDate, formatToUse)}${timezoneSuffix}`;

          return { value, displayValue };
        }

        if (newOperand === RecordFilterOperand.IS_RELATIVE) {
          return { value: '', displayValue: '' };
        }

        break;
      }
    }

    return {
      value: '',
      displayValue: '',
    };
  };

  return {
    getInitialFilterValue,
  };
};
