import { RelationType } from '@/settings/data-model/types/RelationType';
import { RelationMetadataType } from '~/generated-metadata/graphql';

import { useObjectMetadataItemForSettings } from '../hooks/useObjectMetadataItemForSettings';
import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useRelationMetadata = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: FieldMetadataItem;
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();

  const relationMetadata =
    fieldMetadataItem?.fromRelationMetadata ||
    fieldMetadataItem?.toRelationMetadata;

  const relationType =
    relationMetadata?.relationType === RelationMetadataType.OneToMany &&
    fieldMetadataItem?.toRelationMetadata
      ? 'MANY_TO_ONE'
      : (relationMetadata?.relationType as RelationType | undefined);

  const relationObjectMetadataId =
    relationMetadata && 'toObjectMetadata' in relationMetadata
      ? relationMetadata.toObjectMetadata.id
      : relationMetadata?.fromObjectMetadata.id;

  const relationObjectMetadataItem = relationObjectMetadataId
    ? findObjectMetadataItemById(relationObjectMetadataId)
    : undefined;

  const relationFieldMetadataId =
    relationMetadata && 'toFieldMetadataId' in relationMetadata
      ? relationMetadata.toFieldMetadataId
      : relationMetadata?.fromFieldMetadataId;

  const relationFieldMetadataItem = relationFieldMetadataId
    ? relationObjectMetadataItem?.fields?.find(
        (field) => field.id === relationFieldMetadataId,
      )
    : undefined;

  return {
    relationFieldMetadataItem,
    relationObjectMetadataItem,
    relationType,
  };
};
