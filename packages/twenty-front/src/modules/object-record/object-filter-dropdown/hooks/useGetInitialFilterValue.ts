import { Temporal } from 'temporal-polyfill';

import { useGetDateFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateFilterDisplayValue';
import { useGetDateTimeFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateTimeFilterDisplayValue';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';

const activeDatePickerOperands = [
  RecordFilterOperand.IS_BEFORE,
  RecordFilterOperand.IS,
  RecordFilterOperand.IS_AFTER,
];

export const useGetInitialFilterValue = () => {
  const { userTimezone } = useUserTimezone();
  const { getDateFilterDisplayValue } = useGetDateFilterDisplayValue();
  const { getDateTimeFilterDisplayValue } = useGetDateTimeFilterDisplayValue();
  const { getRelativeDateFilterWithUserTimezone } =
    useGetRelativeDateFilterWithUserTimezone();

  const getInitialFilterValue = (
    newType: FilterableAndTSVectorFieldType,
    newOperand: RecordFilterOperand,
    alreadyExistingZonedDateTime?: Temporal.ZonedDateTime,
  ): Pick<RecordFilter, 'value' | 'displayValue'> | Record<string, never> => {
    if (newOperand === RecordFilterOperand.IS_RELATIVE) {
      const newRelativeDateFilter = getRelativeDateFilterWithUserTimezone(
        DEFAULT_RELATIVE_DATE_FILTER_VALUE,
      );

      return {
        value: stringifyRelativeDateFilter(newRelativeDateFilter),
        displayValue: getRelativeDateDisplayValue(newRelativeDateFilter),
      };
    }

    switch (newType) {
      case 'DATE': {
        if (activeDatePickerOperands.includes(newOperand)) {
          const referenceDate =
            alreadyExistingZonedDateTime ??
            Temporal.Now.zonedDateTimeISO(userTimezone);

          const value = referenceDate.toPlainDate().toString();

          const { displayValue } = getDateFilterDisplayValue(referenceDate);

          return { value, displayValue };
        }

        break;
      }
      case 'DATE_TIME': {
        if (activeDatePickerOperands.includes(newOperand)) {
          const referenceDate =
            alreadyExistingZonedDateTime ??
            Temporal.Now.zonedDateTimeISO(userTimezone);

          if (newOperand === RecordFilterOperand.IS) {
            const value = referenceDate.toPlainDate().toString();

            const { displayValue } = getDateFilterDisplayValue(referenceDate);

            return { value, displayValue };
          }

          const value = referenceDate.toInstant().toString();

          const { displayValue } = getDateTimeFilterDisplayValue(referenceDate);

          return { value, displayValue };
        }

        break;
      }
      case 'BOOLEAN': {
        if (newOperand === RecordFilterOperand.IS) {
          return { value: 'false', displayValue: 'false' };
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
