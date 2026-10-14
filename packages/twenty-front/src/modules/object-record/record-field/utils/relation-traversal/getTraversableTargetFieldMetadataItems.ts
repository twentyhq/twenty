import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

// Fields of the related object that a traversed view field may show: a second
// relation hop is not supported.
export const getTraversableTargetFieldMetadataItems = (
  targetObjectMetadataItem: EnrichedObjectMetadataItem,
) =>
  targetObjectMetadataItem.readableFields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type !== FieldMetadataType.RELATION &&
      fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION &&
      isActiveFieldMetadataItem({ fieldMetadata: fieldMetadataItem }),
  );
