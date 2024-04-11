import { FieldDefinition } from '../FieldDefinition';
import { FieldDateMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldDate = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDateMetadata> => field.type === 'DATE';
