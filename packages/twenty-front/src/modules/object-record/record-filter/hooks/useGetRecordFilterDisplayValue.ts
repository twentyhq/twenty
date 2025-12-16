import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useGetDateTimeFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateTimeFilterDisplayValue';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { UserContext } from '@/users/contexts/UserContext';
import { isValid } from 'date-fns';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { type Nullable } from 'twenty-shared/types';
import {
  getDateFromPlainDate,
  isDefined,
  isEmptinessOperand,
  parseJson,
  relativeDateFilterStringifiedSchema,
  shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone,
} from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';

// TODO: finish the implementation of this hook to obtain filter display value and remove deprecated display value property
export const useGetRecordFilterDisplayValue = () => {
  const { dateFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);
  const { userTimezone } = useUserTimezone();

  const { getDateTimeFilterDisplayValue } = useGetDateTimeFilterDisplayValue();

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const getRecordFilterDisplayValue = (
    recordFilter?: Nullable<RecordFilter>,
  ) => {
    if (!isDefined(recordFilter)) {
      return '';
    }

    const filterType = recordFilter.type;

    const operandIsEmptiness = isEmptinessOperand(recordFilter.operand);
    const recordFilterIsEmpty = isRecordFilterConsideredEmpty(recordFilter);

    if (filterType === 'DATE') {
      switch (recordFilter.operand) {
        case RecordFilterOperand.IS: {
          const date = getDateFromPlainDate(recordFilter.value);

          const shiftedDate =
            shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone(
              date,
              userTimezone,
              'add',
            );

          if (!isValid(date)) {
            return '';
          }

          const formattedDate = formatDateString({
            value: shiftedDate.toISOString(),
            timeZone,
            dateFormat,
            localeCatalog: dateLocale.localeCatalog,
          });

          return `${formattedDate}`;
        }
        case RecordFilterOperand.IS_RELATIVE: {
          const relativeDateFilter =
            relativeDateFilterStringifiedSchema.safeParse(recordFilter.value);

          if (!relativeDateFilter.success) {
            return ``;
          }

          const relativeDateDisplayValue = getRelativeDateDisplayValue(
            relativeDateFilter.data,
          );

          return ` ${relativeDateDisplayValue}`;
        }
        case RecordFilterOperand.IS_TODAY:
        case RecordFilterOperand.IS_IN_FUTURE:
        case RecordFilterOperand.IS_IN_PAST:
          return '';
        default:
          return ` ${recordFilter.displayValue}`;
      }
    } else if (recordFilter.type === 'DATE_TIME') {
      switch (recordFilter.operand) {
        case RecordFilterOperand.IS:
        case RecordFilterOperand.IS_AFTER:
        case RecordFilterOperand.IS_BEFORE: {
          const pointInTime = new Date(recordFilter.value);

          if (!isValid(pointInTime)) {
            return '';
          }

          const { displayValue } = getDateTimeFilterDisplayValue(pointInTime);

          return `${displayValue}`;
        }
        case RecordFilterOperand.IS_RELATIVE: {
          const relativeDateFilter =
            relativeDateFilterStringifiedSchema.safeParse(recordFilter.value);

          if (!relativeDateFilter.success) {
            return ``;
          }

          const relativeDateDisplayValue = getRelativeDateDisplayValue(
            relativeDateFilter.data,
          );

          return `${relativeDateDisplayValue}`;
        }
        case RecordFilterOperand.IS_TODAY:
        case RecordFilterOperand.IS_IN_FUTURE:
        case RecordFilterOperand.IS_IN_PAST:
          return '';
        default:
          return `${recordFilter.displayValue}`;
      }
    } else if (
      recordFilter.type === 'SELECT' ||
      recordFilter.type === 'MULTI_SELECT'
    ) {
      const valueArray = parseJson<string[]>(recordFilter.value);

      if (!Array.isArray(valueArray)) {
        return '';
      }

      const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow(
        recordFilter.fieldMetadataId,
      );

      const fieldMetadataItemOptions = fieldMetadataItem.options;

      const optionLabels = valueArray.map(
        (value) =>
          fieldMetadataItemOptions?.find((option) => option.value === value)
            ?.label,
      );

      return `${optionLabels.join(', ')}`;
    }

    if (!operandIsEmptiness && !recordFilterIsEmpty) {
      return `${recordFilter.displayValue}`;
    }

    if (operandIsEmptiness) {
      return ``;
    }

    return recordFilter.displayValue;
  };

  return {
    getRecordFilterDisplayValue,
  };
};
