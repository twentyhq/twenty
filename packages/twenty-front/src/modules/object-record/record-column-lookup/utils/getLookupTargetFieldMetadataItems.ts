import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

// A lookup shows one value of the related record, never another relation
export const getLookupTargetFieldMetadataItems = (
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'readableFields'
  >,
) =>
  relationObjectMetadataItem.readableFields
    .filter(
      (fieldMetadataItem) =>
        isActiveFieldMetadataItem({ fieldMetadata: fieldMetadataItem }) &&
        fieldMetadataItem.type !== FieldMetadataType.RELATION &&
        fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION,
    )
    .toSorted(
      (fieldMetadataItemA, fieldMetadataItemB) =>
        Number(fieldMetadataItemA.isSystem === true) -
        Number(fieldMetadataItemB.isSystem === true),
    );
