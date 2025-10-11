import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getDateFilterDisplayValue } from '@/object-record/record-filter/utils/getDateFilterDisplayValue';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';

export const getInitialFilterValue = (
  newType: FilterableAndTSVectorFieldType,
  newOperand: RecordFilterOperand,
): Pick<RecordFilter, 'value' | 'displayValue'> | Record<string, never> => {
  switch (newType) {
    case 'DATE':
    case 'DATE_TIME': {
      const activeDatePickerOperands = [
        RecordFilterOperand.IS_BEFORE,
        RecordFilterOperand.IS,
        RecordFilterOperand.IS_AFTER,
      ];

      if (activeDatePickerOperands.includes(newOperand)) {
        const date = new Date();
        const value = date.toISOString();

        const { displayValue } = getDateFilterDisplayValue(date, newType);

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
