import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldURLMetadata } from '../FieldMetadata';

export const isFieldURL = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldURLMetadata> => field.type === 'url';
