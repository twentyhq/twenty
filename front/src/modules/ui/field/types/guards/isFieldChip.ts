import { FieldDefinition } from '../FieldDefinition';
import { FieldChipMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldChip = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldChipMetadata> => field.type === 'chip';
