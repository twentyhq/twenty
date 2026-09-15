import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const findFieldMetadataItemByDiffKey = (
  fieldMetadataItems: FieldMetadataItem[],
  diffKey: string,
): FieldMetadataItem | undefined => {
  const fieldMetadataItemByName = fieldMetadataItems.find(
    (fieldMetadataItem) => fieldMetadataItem.name === diffKey,
  );

  if (fieldMetadataItemByName) {
    return fieldMetadataItemByName;
  }

  return fieldMetadataItems.find((fieldMetadataItem) => {
    const joinColumnName =
      fieldMetadataItem.settings?.joinColumnName ??
      computeRelationGqlFieldJoinColumnName({ name: fieldMetadataItem.name });

    return joinColumnName === diffKey;
  });
};
