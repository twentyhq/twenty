import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

export const isValidJunctionTargetField = ({
  fieldMetadataItem,
  sourceFieldMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  sourceFieldMetadataId?: string;
}): boolean => {
  const relations =
    fieldMetadataItem.type === FieldMetadataType.RELATION
      ? fieldMetadataItem.relation
        ? [fieldMetadataItem.relation]
        : []
      : fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION
        ? (fieldMetadataItem.morphRelations ?? [])
        : [];

  return (
    relations.length > 0 &&
    relations.every(({ type }) => type === RelationType.MANY_TO_ONE) &&
    fieldMetadataItem.id !== sourceFieldMetadataId &&
    relations.every(
      ({ sourceFieldMetadata }) =>
        sourceFieldMetadata.id !== sourceFieldMetadataId,
    )
  );
};
