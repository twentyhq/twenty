import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';

// select fields store option values, which read better as the labels the person knows
export const readFieldOptionLabels = (
  fieldDefinition: FieldDefinition<FieldMetadata>,
  value: unknown,
): unknown => {
  const findOptionLabel = (optionValue: unknown) =>
    isFieldSelect(fieldDefinition) || isFieldMultiSelect(fieldDefinition)
      ? (fieldDefinition.metadata.options.find(
          (option) => option.value === optionValue,
        )?.label ?? optionValue)
      : optionValue;

  return Array.isArray(value)
    ? value.map(findOptionLabel)
    : findOptionLabel(value);
};
