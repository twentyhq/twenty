import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

export const getActiveFieldMetadataItems = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'readableFields'>,
) =>
  objectMetadataItem.readableFields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive && !isHiddenSystemField(fieldMetadataItem),
  );
