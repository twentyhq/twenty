import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';

export const getRelationTargetFieldMetadataItems = ({
  relationObjectMetadataItem,
  isEligible,
}: {
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'readableFields'
  >;
  isEligible: (fieldMetadataItem: FieldMetadataItem) => boolean;
}) =>
  relationObjectMetadataItem.readableFields
    .filter(
      (fieldMetadataItem) =>
        isActiveFieldMetadataItem({ fieldMetadata: fieldMetadataItem }) &&
        isEligible(fieldMetadataItem),
    )
    .toSorted(
      (fieldMetadataItemA, fieldMetadataItemB) =>
        Number(fieldMetadataItemA.isSystem === true) -
        Number(fieldMetadataItemB.isSystem === true),
    );
