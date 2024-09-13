import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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

  const relationDefinition = fieldMetadataItemOnSourceRecord.relationDefinition;

  if (!relationDefinition) return null;

  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === relationDefinition.targetObjectMetadata.id,
  );

  if (!targetObjectMetadataItem) return null;

  const fieldMetadataItemOnTargetRecord = targetObjectMetadataItem.fields.find(
    (field) => field.id === relationDefinition.sourceFieldMetadata.id,
  );

  if (!fieldMetadataItemOnTargetRecord) return null;

  return {
    fieldMetadataItemOnTargetRecord,
    targetObjectMetadataItem,
    relationType: relationDefinition.direction,
  };
};
