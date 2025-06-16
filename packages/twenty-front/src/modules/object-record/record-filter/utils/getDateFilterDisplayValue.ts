import { FilterableAndTSVectorFieldType } from '@/object-record/record-filter/types/FilterableFieldType';

export const getDateFilterDisplayValue = (
  value: Date,
  fieldType: FilterableAndTSVectorFieldType,
) => {
  const displayValue =
    fieldType === 'DATE_TIME'
      ? value.toLocaleString()
      : value.toLocaleDateString();

  return { displayValue };
};
