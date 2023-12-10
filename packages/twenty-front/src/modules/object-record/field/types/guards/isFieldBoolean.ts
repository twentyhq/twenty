import { FieldDefinition } from '../FieldDefinition';
import { FieldBooleanMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldBoolean = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldBooleanMetadata> => field.type === 'BOOLEAN';
