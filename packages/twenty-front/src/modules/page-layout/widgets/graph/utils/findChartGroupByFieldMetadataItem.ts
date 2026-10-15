import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { isDefined } from 'twenty-shared/utils';

export const findChartGroupByFieldMetadataItem = ({
  fieldMetadataItems,
  groupByFieldMetadataId,
}: {
  fieldMetadataItems: FieldMetadataItem[] | undefined;
  groupByFieldMetadataId: string | null | undefined;
}): FieldMetadataItem | undefined => {
  if (!isDefined(groupByFieldMetadataId)) {
    return undefined;
  }

  const fieldMetadataItem = findFieldMetadataItemByFieldMetadataId({
    fieldMetadataItems,
    fieldMetadataId: groupByFieldMetadataId,
  });

  const matchingMorphRelation = fieldMetadataItem?.morphRelations?.find(
    ({ sourceFieldMetadata }) =>
      sourceFieldMetadata.id === groupByFieldMetadataId,
  );

  if (!isDefined(fieldMetadataItem) || !isDefined(matchingMorphRelation)) {
    return fieldMetadataItem;
  }

  return {
    ...fieldMetadataItem,
    name: matchingMorphRelation.sourceFieldMetadata.name,
  };
};
