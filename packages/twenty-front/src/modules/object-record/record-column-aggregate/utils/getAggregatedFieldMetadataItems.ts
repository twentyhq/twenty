import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { getRelationAggregateOperations } from '@/object-record/record-column-aggregate/utils/getRelationAggregateOperations';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const getAggregatedFieldMetadataItems = (
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'readableFields'
  >,
) =>
  relationObjectMetadataItem.readableFields
    .filter(
      (fieldMetadataItem) =>
        isActiveFieldMetadataItem({ fieldMetadata: fieldMetadataItem }) &&
        isNonEmptyArray(getRelationAggregateOperations(fieldMetadataItem)),
    )
    .toSorted(
      (fieldMetadataItemA, fieldMetadataItemB) =>
        Number(fieldMetadataItemA.isSystem === true) -
        Number(fieldMetadataItemB.isSystem === true),
    );
