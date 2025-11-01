import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useGetDateTimeFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateTimeFilterDisplayValue';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { UserContext } from '@/users/contexts/UserContext';
import { isValid } from 'date-fns';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import {
  getDateFromPlainDate,
  isEmptinessOperand,
  parseJson,
  relativeDateFilterStringifiedSchema,
  shiftPointInTimeFromTimezoneDifferenceInMinutesWithSystemTimezone,
} from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';

export const useGetRecordFilterLabelValue = () => {
  const { dateFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);
  const { userTimezone } = useUserTimezone();

  const { getDateTimeFilterDisplayValue } = useGetDateTimeFilterDisplayValue();

  const getRecordFilterLabelValue = ({
    recordFilter,
    fieldMetadataOptions,
  }: {
    recordFilter: RecordFilter;
    fieldMetadataOptions?: FieldMetadataItemOption[];
  }) => {
    const operandLabelShort = getOperandLabelShort(recordFilter.operand);
    const operandIsEmptiness = isEmptinessOperand(recordFilter.operand);
    const recordFilterIsEmpty = isRecordFilterConsideredEmpty(recordFilter);

    if (recordFilter.type === 'DATE') {
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
            return `${operandLabelShort}`;
          }

          const formattedDate = formatDateString({
            value: shiftedDate.toISOString(),
            timeZone,
            dateFormat,
            localeCatalog: dateLocale.localeCatalog,
          });

          return `${operandLabelShort} ${formattedDate}`;
        }
        case RecordFilterOperand.IS_RELATIVE: {
          const relativeDateFilter =
            relativeDateFilterStringifiedSchema.safeParse(recordFilter.value);

          if (!relativeDateFilter.success) {
            return `${operandLabelShort}`;
          }

          const relativeDateDisplayValue = getRelativeDateDisplayValue(
            relativeDateFilter.data,
          );

          return `${operandLabelShort} ${relativeDateDisplayValue}`;
        }
        case RecordFilterOperand.IS_TODAY:
        case RecordFilterOperand.IS_IN_FUTURE:
        case RecordFilterOperand.IS_IN_PAST:
          return operandLabelShort;
        default:
          return `${operandLabelShort} ${recordFilter.displayValue}`;
      }
    } else if (recordFilter.type === 'DATE_TIME') {
      switch (recordFilter.operand) {
        case RecordFilterOperand.IS:
        case RecordFilterOperand.IS_AFTER:
        case RecordFilterOperand.IS_BEFORE: {
          const pointInTime = new Date(recordFilter.value);

          const { displayValue } = getDateTimeFilterDisplayValue(pointInTime);

          return `${operandLabelShort} ${displayValue}`;
        }
        case RecordFilterOperand.IS_RELATIVE: {
          const relativeDateFilter =
            relativeDateFilterStringifiedSchema.safeParse(recordFilter.value);

          if (!relativeDateFilter.success) {
            return `${operandLabelShort}`;
          }

          const relativeDateDisplayValue = getRelativeDateDisplayValue(
            relativeDateFilter.data,
          );

          return `${operandLabelShort} ${relativeDateDisplayValue}`;
        }
        case RecordFilterOperand.IS_TODAY:
        case RecordFilterOperand.IS_IN_FUTURE:
        case RecordFilterOperand.IS_IN_PAST:
          return operandLabelShort;
        default:
          return `${operandLabelShort} ${recordFilter.displayValue}`;
      }
    } else if (
      recordFilter.type === 'SELECT' ||
      recordFilter.type === 'MULTI_SELECT'
    ) {
      const valueArray = parseJson<string[]>(recordFilter.value);

      if (!Array.isArray(valueArray)) {
        return '';
      }

      const optionLabels = valueArray.map(
        (value) =>
          fieldMetadataOptions?.find((option) => option.value === value)?.label,
      );

      return `${operandLabelShort} ${optionLabels.join(', ')}`;
    }

    if (!operandIsEmptiness && !recordFilterIsEmpty) {
      return `${operandLabelShort} ${recordFilter.displayValue}`;
    }

    if (operandIsEmptiness) {
      return `${operandLabelShort}`;
    }

    return recordFilter.displayValue;
  };

  return { getRecordFilterLabelValue };
};
