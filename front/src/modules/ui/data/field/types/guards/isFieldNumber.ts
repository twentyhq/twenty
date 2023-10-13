import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldNumberMetadata } from '../FieldMetadata';

export const isFieldNumber = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldNumberMetadata> => field.type === 'number';
