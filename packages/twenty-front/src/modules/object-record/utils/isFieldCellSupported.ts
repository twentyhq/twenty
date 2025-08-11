import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldCellSupported = (
  fieldMetadataItem: FieldMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
) => {
  if (
    [
      FieldMetadataType.UUID,
      FieldMetadataType.POSITION,
      FieldMetadataType.RICH_TEXT,
    ].includes(fieldMetadataItem.type)
  ) {
    return false;
  }

  if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
    const relationObjectMetadataItemId =
      fieldMetadataItem.relation?.targetObjectMetadata.id;

    const relationObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === relationObjectMetadataItemId,
    );

    // Hack to display targets on Notes and Tasks
    if (
      fieldMetadataItem.relation?.targetObjectMetadata?.nameSingular ===
        CoreObjectNameSingular.NoteTarget &&
      fieldMetadataItem.relation?.sourceObjectMetadata.nameSingular ===
        CoreObjectNameSingular.Note
    ) {
      return true;
    }

    if (
      fieldMetadataItem.relation?.targetObjectMetadata?.nameSingular ===
        CoreObjectNameSingular.TaskTarget &&
      fieldMetadataItem.relation?.sourceObjectMetadata.nameSingular ===
        CoreObjectNameSingular.Task
    ) {
      return true;
    }

    if (
      !fieldMetadataItem.relation ||
      !relationObjectMetadataItem ||
      !isObjectMetadataAvailableForRelation(relationObjectMetadataItem)
    ) {
      return false;
    }
  }

  return !fieldMetadataItem.isSystem && !!fieldMetadataItem.isActive;
};
