import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { isDefined } from 'twenty-shared/utils';

export const findChartGroupByFieldMetadataItem = ({
  fieldMetadataItems,
  groupByFieldMetadataId,
}: {
  fieldMetadataItems: FieldMetadataItem[] | undefined;
  groupByFieldMetadataId: string;
}): FieldMetadataItem | undefined => {
  const fieldMetadataItem = findFieldMetadataItemByFieldMetadataId({
    fieldMetadataItems,
    fieldMetadataId: groupByFieldMetadataId,
  });

  if (!isDefined(fieldMetadataItem)) {
    return undefined;
  }

  const morphRelationTargetField = fieldMetadataItem.morphRelations?.find(
    ({ sourceFieldMetadata }) =>
      sourceFieldMetadata.id === groupByFieldMetadataId,
  )?.sourceFieldMetadata;

  if (!isDefined(morphRelationTargetField)) {
    return fieldMetadataItem;
  }

  return { ...fieldMetadataItem, name: morphRelationTargetField.name };
};
