import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RelationType } from '@/settings/data-model/types/RelationType';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

export const getRelationMetadata = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'fromRelationMetadata' | 'toRelationMetadata' | 'type'
  >;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  if (fieldMetadataItem.type !== FieldMetadataType.Relation) return null;

  const relationMetadata =
    fieldMetadataItem.fromRelationMetadata ||
    fieldMetadataItem.toRelationMetadata;

  if (!relationMetadata) return null;

  const relationFieldMetadataId =
    'toFieldMetadataId' in relationMetadata
      ? relationMetadata.toFieldMetadataId
      : relationMetadata.fromFieldMetadataId;

  if (!relationFieldMetadataId) return null;

  const relationType =
    relationMetadata.relationType === RelationMetadataType.OneToMany &&
    fieldMetadataItem.toRelationMetadata
      ? 'MANY_TO_ONE'
      : (relationMetadata.relationType as RelationType);

  const relationObjectMetadataNameSingular =
    'toObjectMetadata' in relationMetadata
      ? relationMetadata.toObjectMetadata.nameSingular
      : relationMetadata.fromObjectMetadata.nameSingular;

  const relationObjectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === relationObjectMetadataNameSingular,
  );

  if (!relationObjectMetadataItem) return null;

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    (field) => field.id === relationFieldMetadataId,
  );

  if (!relationFieldMetadataItem) return null;

  return {
    relationFieldMetadataItem,
    relationObjectMetadataItem,
    relationType,
  };
};
