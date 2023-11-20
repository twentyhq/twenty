import { FieldDefinition } from '../FieldDefinition';
import { FieldChipMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldChip = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldChipMetadata> => field.type === 'CHIP';
