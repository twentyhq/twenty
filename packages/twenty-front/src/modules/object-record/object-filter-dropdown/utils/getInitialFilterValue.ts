import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { z } from 'zod';

export const getInitialFilterValue = (
  newType: FilterableFieldType,
  newOperand: RecordFilterOperand,
  oldValue?: string,
  oldDisplayValue?: string,
): Pick<RecordFilter, 'value' | 'displayValue'> | Record<string, never> => {
  switch (newType) {
    case 'DATE':
    case 'DATE_TIME': {
      const activeDatePickerOperands = [
        RecordFilterOperand.IsBefore,
        RecordFilterOperand.Is,
        RecordFilterOperand.IsAfter,
      ];

      if (activeDatePickerOperands.includes(newOperand)) {
        const date = z.coerce.date().safeParse(oldValue).data ?? new Date();
        const value = date.toISOString();
        const displayValue =
          newType === 'DATE'
            ? date.toLocaleString()
            : date.toLocaleDateString();

        return { value, displayValue };
      }

      if (newOperand === RecordFilterOperand.IsRelative) {
        return { value: '', displayValue: '' };
      }
      break;
    }
  }

  return {
    value: oldValue ?? '',
    displayValue: oldDisplayValue ?? '',
  };
};
