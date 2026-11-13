import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { shouldDisplayFormMultiEditField } from '@/object-record/record-update-multiple/utils/shouldDisplayFormMultiEditField';

// The server refuses an update that writes a field the member cannot edit,
// so only fields that are both readable and updatable can be offered
export const getFieldsEditableInMultiEditForm = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  const readableFieldIds = new Set(
    objectMetadataItem.readableFields.map((field) => field.id),
  );

  return objectMetadataItem.updatableFields
    .filter(
      (field) =>
        readableFieldIds.has(field.id) && shouldDisplayFormMultiEditField(field),
    )
    .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name));
};
