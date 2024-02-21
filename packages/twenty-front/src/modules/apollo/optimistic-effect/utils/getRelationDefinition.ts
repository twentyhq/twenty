import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RelationType } from '@/settings/data-model/types/RelationType';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

export const getRelationDefinition = ({
  objectMetadataItems,
  fieldMetadataItemOnSourceRecord,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  fieldMetadataItemOnSourceRecord: FieldMetadataItem;
}) => {
  if (fieldMetadataItemOnSourceRecord.type !== FieldMetadataType.Relation) {
    return null;
  }

  const relationMetadataItem =
    fieldMetadataItemOnSourceRecord.fromRelationMetadata ||
    fieldMetadataItemOnSourceRecord.toRelationMetadata;

  if (!relationMetadataItem) return null;

  const relationSourceFieldMetadataItemId =
    'toFieldMetadataId' in relationMetadataItem
      ? relationMetadataItem.toFieldMetadataId
      : relationMetadataItem.fromFieldMetadataId;

  if (!relationSourceFieldMetadataItemId) return null;

  // TODO: precise naming, is it relationTypeFromTargetPointOfView or relationTypeFromSourcePointOfView ?
  const relationType =
    relationMetadataItem.relationType === RelationMetadataType.OneToMany &&
    fieldMetadataItemOnSourceRecord.toRelationMetadata
      ? ('MANY_TO_ONE' satisfies RelationType)
      : (relationMetadataItem.relationType as RelationType);

  const targetObjectMetadataNameSingular =
    'toObjectMetadata' in relationMetadataItem
      ? relationMetadataItem.toObjectMetadata.nameSingular
      : relationMetadataItem.fromObjectMetadata.nameSingular;

  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === targetObjectMetadataNameSingular,
  );

  if (!targetObjectMetadataItem) return null;

  const fieldMetadataItemOnTargetRecord = targetObjectMetadataItem.fields.find(
    (field) => field.id === relationSourceFieldMetadataItemId,
  );

  if (!fieldMetadataItemOnTargetRecord) return null;

  return {
    fieldMetadataItemOnTargetRecord,
    targetObjectMetadataItem,
    relationType,
  };
};
