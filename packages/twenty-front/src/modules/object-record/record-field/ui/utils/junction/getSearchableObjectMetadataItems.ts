import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getTargetObjectMetadataIdsFromField } from './getTargetObjectMetadataIdsFromField';
import { isDefined } from 'twenty-shared/utils';

export const getSearchableObjectMetadataItems = (
  targetFields: FieldMetadataItem[],
  objectMetadataItems: ObjectMetadataItem[],
): ObjectMetadataItem[] => {
  const targetObjectIds = targetFields.flatMap(
    getTargetObjectMetadataIdsFromField,
  );
  const uniqueTargetObjectIds = [...new Set(targetObjectIds)];

  return uniqueTargetObjectIds
    .map((id) => objectMetadataItems.find((item) => item.id === id))
    .filter(isDefined);
};
