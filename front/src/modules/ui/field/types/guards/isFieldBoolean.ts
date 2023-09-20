import { FieldDefinition } from '../FieldDefinition';
import { FieldBooleanMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldBoolean = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldBooleanMetadata> => field.type === 'boolean';
