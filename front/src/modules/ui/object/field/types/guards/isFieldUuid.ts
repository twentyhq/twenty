import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldUuidMetadata } from '../FieldMetadata';

export const isFieldUuid = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldUuidMetadata> => field.type === 'UUID';
