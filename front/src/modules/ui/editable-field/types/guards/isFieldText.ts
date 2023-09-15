import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldTextMetadata } from '../FieldMetadata';

export const isFieldText = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldTextMetadata> => field.type === 'text';
