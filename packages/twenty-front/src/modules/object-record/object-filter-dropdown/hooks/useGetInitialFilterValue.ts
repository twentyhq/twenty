import { Temporal } from 'temporal-polyfill';

import { useGetDateFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateFilterDisplayValue';
import { useGetDateTimeFilterDisplayValue } from '@/object-record/object-filter-dropdown/hooks/useGetDateTimeFilterDisplayValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';

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
  const featureFlags = useFeatureFlagsMap();
  const isWholeDayFilterEnabled =
    featureFlags.IS_DATE_TIME_WHOLE_DAY_FILTER_ENABLED ?? false;

  const getInitialFilterValue = (
    newType: FilterableAndTSVectorFieldType,
    newOperand: RecordFilterOperand,
    alreadyExistingZonedDateTime?: Temporal.ZonedDateTime,
  ): Pick<RecordFilter, 'value' | 'displayValue'> | Record<string, never> => {
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

          if (
            isWholeDayFilterEnabled === true &&
            newOperand === RecordFilterOperand.IS
          ) {
            const value = referenceDate.toPlainDate().toString();

            const { displayValue } = getDateFilterDisplayValue(referenceDate);

            return { value, displayValue };
          }

          const value = referenceDate.toInstant().toString();

          const { displayValue } = getDateTimeFilterDisplayValue(referenceDate);

          return { value, displayValue };
        }

        if (newOperand === RecordFilterOperand.IS_RELATIVE) {
          return { value: '', displayValue: '' };
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
