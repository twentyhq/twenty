import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { z } from 'zod';

export const getInitialFilterValue = (
  newType: FilterableFieldType,
  newOperand: ViewFilterOperand,
  oldValue?: string,
  oldDisplayValue?: string,
): Pick<Filter, 'value' | 'displayValue'> | Record<string, never> => {
  switch (newType) {
    case 'DATE':
    case 'DATE_TIME': {
      const activeDatePickerOperands = [
        ViewFilterOperand.IsBefore,
        ViewFilterOperand.Is,
        ViewFilterOperand.IsAfter,
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

      if (newOperand === ViewFilterOperand.IsRelative) {
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
