import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

export const isFieldCellSupported = (fieldMetadataItem: FieldMetadataItem) => {
  if (
    [
      FieldMetadataType.Uuid,
      FieldMetadataType.Position,
      FieldMetadataType.RichText,
    ].includes(fieldMetadataItem.type)
  ) {
    return false;
  }

  if (fieldMetadataItem.type === FieldMetadataType.Relation) {
    const relationMetadata =
      fieldMetadataItem.fromRelationMetadata ??
      fieldMetadataItem.toRelationMetadata;
    const relationObjectMetadataItem =
      fieldMetadataItem.fromRelationMetadata?.toObjectMetadata ??
      fieldMetadataItem.toRelationMetadata?.fromObjectMetadata;

    // Hack to display targets on Notes and Tasks
    if (
      fieldMetadataItem.fromRelationMetadata?.toObjectMetadata?.nameSingular ===
        CoreObjectNameSingular.NoteTarget &&
      fieldMetadataItem.relationDefinition?.sourceObjectMetadata
        .nameSingular === CoreObjectNameSingular.Note
    ) {
      return true;
    }

    if (
      fieldMetadataItem.fromRelationMetadata?.toObjectMetadata?.nameSingular ===
        CoreObjectNameSingular.TaskTarget &&
      fieldMetadataItem.relationDefinition?.sourceObjectMetadata
        .nameSingular === CoreObjectNameSingular.Task
    ) {
      return true;
    }

    if (
      !relationMetadata ||
      // TODO: Many to many relations are not supported yet.
      relationMetadata.relationType === RelationMetadataType.ManyToMany ||
      !relationObjectMetadataItem ||
      !isObjectMetadataAvailableForRelation(relationObjectMetadataItem)
    ) {
      return false;
    }
  }

  return !fieldMetadataItem.isSystem && !!fieldMetadataItem.isActive;
};
