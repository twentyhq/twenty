import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getSummaryFieldMetadataItems } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItems';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/NonStandardAggregateOperationsOptions';
import { isNonEmptyArray } from 'twenty-shared/utils';

// The fields of a join object's target records are two hops away, too far for the server to summarize
export const getSummaryAggregateOperationOptions = ({
  relationObjectMetadataItem,
  isJunctionRelation,
}: {
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'readableFields'
  >;
  isJunctionRelation: boolean;
}): AggregateOperations[] => [
  AggregateOperations.COUNT,
  ...(isJunctionRelation
    ? []
    : NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.filter((aggregateOperation) =>
        isNonEmptyArray(
          getSummaryFieldMetadataItems({
            relationObjectMetadataItem,
            aggregateOperation,
          }),
        ),
      )),
];
