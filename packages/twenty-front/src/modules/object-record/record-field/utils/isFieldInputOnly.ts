import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldRating } from '../types/guards/isFieldRating';

export const isFieldInputOnly = (
  fieldDefinition: FieldDefinition<FieldMetadata>,
) => {
  return isFieldBoolean(fieldDefinition) || isFieldRating(fieldDefinition);
};
