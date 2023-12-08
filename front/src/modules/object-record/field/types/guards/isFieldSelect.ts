import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldSelectMetadata } from '../FieldMetadata';

export const isFieldSelect = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldSelectMetadata> => field.type === 'ENUM';
