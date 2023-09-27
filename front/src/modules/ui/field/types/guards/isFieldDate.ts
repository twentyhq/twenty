import { FieldDefinition } from '../FieldDefinition';
import { FieldDateMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldDate = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldDateMetadata> => field.type === 'date';
