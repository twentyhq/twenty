import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldURLMetadata } from '../FieldMetadata';

export const isFieldURL = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldURLMetadata> => field.type === 'URL';
