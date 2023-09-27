import { FieldDefinition } from '../FieldDefinition';
import { FieldDoubleTextMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldDoubleText = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldDoubleTextMetadata> =>
  field.type === 'double-text';
