import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

export const isFieldCellSupported = (fieldMetadataItem: FieldMetadataItem) => {
  if (
    [FieldMetadataType.Uuid, FieldMetadataType.Position].includes(
      fieldMetadataItem.type,
    )
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
