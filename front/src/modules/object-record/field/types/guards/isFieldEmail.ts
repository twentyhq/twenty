import { FieldDefinition } from '../FieldDefinition';
import { FieldEmailMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldEmail = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldEmailMetadata> => field.type === 'EMAIL';
