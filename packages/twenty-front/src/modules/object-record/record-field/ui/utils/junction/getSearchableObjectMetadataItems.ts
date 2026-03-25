import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getTargetObjectMetadataIdsFromField } from './getTargetObjectMetadataIdsFromField';
import { isDefined } from 'twenty-shared/utils';

export const getSearchableObjectMetadataItems = (
  targetFields: FieldMetadataItem[],
  objectMetadataItems: EnrichedObjectMetadataItem[],
): EnrichedObjectMetadataItem[] => {
  const targetObjectIds = targetFields.flatMap(
    getTargetObjectMetadataIdsFromField,
  );
  const uniqueTargetObjectIds = [...new Set(targetObjectIds)];

  return uniqueTargetObjectIds
    .map((id) => objectMetadataItems.find((item) => item.id === id))
    .filter(isDefined);
};
