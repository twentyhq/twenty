import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';

export const isFieldInputOnly = (
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): boolean => {
  return isFieldBoolean(fieldDefinition) || isFieldRating(fieldDefinition);
};
