import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLookupTargetFieldMetadataItems } from '@/object-record/record-column-lookup/utils/getLookupTargetFieldMetadataItems';
import { getSummaryAggregateOperations } from '@/object-record/record-column-summary/utils/getSummaryAggregateOperations';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export const getSummaryFieldMetadataItems = ({
  relationObjectMetadataItem,
  aggregateOperation,
}: {
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'readableFields'
  >;
  aggregateOperation: AggregateOperations;
}) =>
  getLookupTargetFieldMetadataItems(relationObjectMetadataItem).filter(
    (fieldMetadataItem) =>
      getSummaryAggregateOperations(fieldMetadataItem).includes(
        aggregateOperation,
      ),
  );
