import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import { type FieldDateMetadata, type FieldMetadata } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldDate = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDateMetadata> => field.type === 'DATE';
