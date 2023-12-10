import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldTextMetadata } from '../FieldMetadata';

export const isFieldText = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldTextMetadata> => field.type === 'TEXT';
