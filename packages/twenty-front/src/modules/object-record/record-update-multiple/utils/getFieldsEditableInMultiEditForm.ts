import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { shouldDisplayFormMultiEditField } from '@/object-record/record-update-multiple/utils/shouldDisplayFormMultiEditField';

export const getFieldsEditableInMultiEditForm = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'updatableFields'>,
) =>
  objectMetadataItem.updatableFields
    .filter(shouldDisplayFormMultiEditField)
    .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name));
