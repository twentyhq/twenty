import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

type GetRecordFieldCardRelationPickerDropdownIdArgs = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
  instanceId: string;
};
export const getRecordFieldCardRelationPickerDropdownId = ({
  fieldDefinition,
  recordId,
  instanceId,
}: GetRecordFieldCardRelationPickerDropdownIdArgs) =>
  `record-field-card-relation-picker:${instanceId}:${fieldDefinition.fieldMetadataId}:${recordId}`;
