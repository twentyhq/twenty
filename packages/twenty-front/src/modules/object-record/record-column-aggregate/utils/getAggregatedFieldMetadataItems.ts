import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { RELATION_AGGREGATE_OPERATIONS_BY_FIELD_TYPE } from '@/object-record/record-column-aggregate/constants/RelationAggregateOperationsByFieldType';
import { isDefined } from 'twenty-shared/utils';

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
        isDefined(
          RELATION_AGGREGATE_OPERATIONS_BY_FIELD_TYPE[fieldMetadataItem.type],
        ),
    )
    .toSorted(
      (fieldMetadataItemA, fieldMetadataItemB) =>
        Number(fieldMetadataItemA.isSystem === true) -
        Number(fieldMetadataItemB.isSystem === true),
    );
