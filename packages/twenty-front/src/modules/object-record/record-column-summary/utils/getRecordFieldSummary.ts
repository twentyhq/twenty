import { TOTAL_COUNT_GQL_FIELD_NAME } from '@/object-record/constants/TotalCountGqlFieldName';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { findById, isDefined } from 'twenty-shared/utils';

// The server already validates the operation against the field, so this only resolves what to query
export const getRecordFieldSummary = ({
  aggregateOperation,
  relationTargetFieldMetadataId,
  relationObjectMetadataItem,
}: {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataId?: string | null;
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'readableFields'
  >;
}): RecordFieldSummary | undefined => {
  if (aggregateOperation === AggregateOperations.COUNT) {
    return {
      aggregateOperation,
      aggregateGqlFieldName: TOTAL_COUNT_GQL_FIELD_NAME,
    };
  }

  const aggregatedFieldMetadataItem = isDefined(relationTargetFieldMetadataId)
    ? relationObjectMetadataItem.readableFields.find(
        findById(relationTargetFieldMetadataId),
      )
    : undefined;

  if (!isDefined(aggregatedFieldMetadataItem)) {
    return undefined;
  }

  const extendedAggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      aggregateOperation,
      aggregatedFieldMetadataItem.type,
    );

  const aggregateGqlFieldName = getAvailableAggregationsFromObjectFields([
    aggregatedFieldMetadataItem,
  ])[aggregatedFieldMetadataItem.name]?.[extendedAggregateOperation];

  return isDefined(aggregateGqlFieldName)
    ? {
        aggregateOperation: extendedAggregateOperation,
        aggregatedFieldMetadataItem,
        aggregateGqlFieldName,
      }
    : undefined;
};
