import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

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
      fieldMetadataItem.relationDefinition?.targetObjectMetadata.id;

    const relationObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === relationObjectMetadataItemId,
    );

    // Hack to display targets on Notes and Tasks
    if (
      fieldMetadataItem.relationDefinition?.targetObjectMetadata
        ?.nameSingular === CoreObjectNameSingular.NoteTarget &&
      fieldMetadataItem.relationDefinition?.sourceObjectMetadata
        .nameSingular === CoreObjectNameSingular.Note
    ) {
      return true;
    }

    if (
      fieldMetadataItem.relationDefinition?.targetObjectMetadata
        ?.nameSingular === CoreObjectNameSingular.TaskTarget &&
      fieldMetadataItem.relationDefinition?.sourceObjectMetadata
        .nameSingular === CoreObjectNameSingular.Task
    ) {
      return true;
    }

    if (
      !fieldMetadataItem.relationDefinition ||
      // TODO: Many to many relations are not supported yet.
      fieldMetadataItem.relationDefinition.direction ===
        RelationDefinitionType.MANY_TO_MANY ||
      !relationObjectMetadataItem ||
      !isObjectMetadataAvailableForRelation(relationObjectMetadataItem)
    ) {
      return false;
    }
  }

  return !fieldMetadataItem.isSystem && !!fieldMetadataItem.isActive;
};
