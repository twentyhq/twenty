import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

type GetRecordFieldCardRelationPickerDropdownIdArgs = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
};
export const getRecordFieldCardRelationPickerDropdownId = ({
  fieldDefinition,
  recordId,
}: GetRecordFieldCardRelationPickerDropdownIdArgs) =>
  `record-field-card-relation-picker-${fieldDefinition.fieldMetadataId}-${recordId}`;
