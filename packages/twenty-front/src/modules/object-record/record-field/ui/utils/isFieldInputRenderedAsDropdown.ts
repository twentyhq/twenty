import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { isFieldSelect } from '@/object-record/record-field/ui/types/guards/isFieldSelect';

export const isFieldInputRenderedAsDropdown = (
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): boolean =>
  isFieldSelect(fieldDefinition) || isFieldMultiSelect(fieldDefinition);
