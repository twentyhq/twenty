import { FieldDefinition } from '../FieldDefinition';
import { FieldDoubleTextChipMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldDoubleTextChip = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDoubleTextChipMetadata> =>
  field.type === 'DOUBLE_TEXT_CHIP';
