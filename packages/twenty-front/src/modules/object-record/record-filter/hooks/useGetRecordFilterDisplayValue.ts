import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useGetDateFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateFilterDisplayValue';
import { useGetDateTimeFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateTimeFilterDisplayValue';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { getTimezoneAbbreviationForZonedDateTime } from '@/ui/input/components/internal/date/utils/getTimeZoneAbbreviationForZonedDateTime';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import {
  isDefined,
  isEmptinessOperand,
  parseJson,
  relativeDateFilterStringifiedSchema,
} from 'twenty-shared/utils';

// TODO: finish the implementation of this hook to obtain filter display value and remove deprecated display value property
export const useGetRecordFilterDisplayValue = () => {
  const { isSystemTimezone, userTimezone } = useUserTimezone();

  const { getDateTimeFilterDisplayValue } = useGetDateTimeFilterDisplayValue();
  const { getDateFilterDisplayValue } = useGetDateFilterDisplayValue();

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

    const nowInZonedDateTime = Temporal.Now.zonedDateTimeISO(userTimezone);

    const shouldDisplayTimeZoneAbbreviation = !isSystemTimezone;
    const timeZoneAbbreviation =
      getTimezoneAbbreviationForZonedDateTime(nowInZonedDateTime);

    if (filterType === 'DATE') {
      switch (recordFilter.operand) {
        case RecordFilterOperand.IS: {
          if (!isDefined(recordFilter.value)) {
            return '';
          }

          const plainDate = Temporal.PlainDate.from(recordFilter.value);

          const { displayValue } = getDateFilterDisplayValue(
            plainDate.toZonedDateTime(userTimezone),
          );

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
            shouldDisplayTimeZoneAbbreviation,
          );

          return ` ${relativeDateDisplayValue}`;
        }
        case RecordFilterOperand.IS_TODAY:
          return shouldDisplayTimeZoneAbbreviation
            ? `(${timeZoneAbbreviation})`
            : '';
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
          if (!isNonEmptyString(recordFilter.value)) {
            return '';
          }

          const zonedDateTime = Temporal.Instant.from(
            recordFilter.value,
          ).toZonedDateTimeISO(userTimezone);

          const { displayValue } = getDateTimeFilterDisplayValue(zonedDateTime);

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
            shouldDisplayTimeZoneAbbreviation,
          );

          return `${relativeDateDisplayValue}`;
        }
        case RecordFilterOperand.IS_TODAY:
          return shouldDisplayTimeZoneAbbreviation
            ? `(${timeZoneAbbreviation})`
            : '';
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
