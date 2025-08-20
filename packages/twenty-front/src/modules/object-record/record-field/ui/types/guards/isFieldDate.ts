import { type FieldDefinition } from '../FieldDefinition';
import { type FieldDateMetadata, type FieldMetadata } from '../FieldMetadata';

export const isFieldDate = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDateMetadata> => field.type === 'DATE';
