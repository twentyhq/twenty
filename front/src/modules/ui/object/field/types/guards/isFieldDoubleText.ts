import { FieldDefinition } from '../FieldDefinition';
import { FieldDoubleTextMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldDoubleText = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDoubleTextMetadata> =>
  field.type === 'DOUBLE_TEXT';
