import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/format-preferences/getDateFormatFromWorkspaceDateFormat';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserDateFormat } from '@/ui/input/components/internal/date/hooks/useUserDateFormat';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';
import {
  getDateFormatString,
  getDateTimeFormatString,
} from '~/utils/date-utils';

const activeDatePickerOperands = [
  RecordFilterOperand.IS_BEFORE,
  RecordFilterOperand.IS,
  RecordFilterOperand.IS_AFTER,
];

export const useGetInitialFilterValue = () => {
  const { userTimezone } = useUserTimezone();
  const { userDateFormat } = useUserDateFormat();

  const getInitialFilterValue = (
    newType: FilterableAndTSVectorFieldType,
    newOperand: RecordFilterOperand,
  ): Pick<RecordFilter, 'value' | 'displayValue'> | Record<string, never> => {
    switch (newType) {
      case 'DATE': {
        if (activeDatePickerOperands.includes(newOperand)) {
          const now = new Date();

          const shiftedDate = new TZDate(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            userTimezone,
          );

          const dateFormatString = getDateFormatString(
            getDateFormatFromWorkspaceDateFormat(userDateFormat),
          );

          const value = format(shiftedDate, DATE_TYPE_FORMAT);
          const displayValue = format(shiftedDate, dateFormatString);

          return { value, displayValue };
        }

        break;
      }
      case 'DATE_TIME': {
        if (activeDatePickerOperands.includes(newOperand)) {
          const now = new Date();

          const shiftedDate = new TZDate(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
            userTimezone,
          );

          const dateTimeFormatString = getDateTimeFormatString(
            getDateFormatFromWorkspaceDateFormat(userDateFormat),
          );

          const value = now.toISOString();
          const displayValue = format(shiftedDate, dateTimeFormatString);

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
