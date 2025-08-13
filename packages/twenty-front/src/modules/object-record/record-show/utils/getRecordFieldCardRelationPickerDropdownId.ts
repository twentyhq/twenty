import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

type GetRecordFieldCardRelationPickerDropdownIdArgs = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
};
export const getRecordFieldCardRelationPickerDropdownId = ({
  fieldDefinition,
  recordId,
}: GetRecordFieldCardRelationPickerDropdownIdArgs) =>
  `record-field-card-relation-picker-${fieldDefinition.fieldMetadataId}-${recordId}`;
