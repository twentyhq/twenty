import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { getSummaryAggregateOperations } from '@/object-record/record-column-summary/utils/getSummaryAggregateOperations';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { findById, isDefined } from 'twenty-shared/utils';

export const getRecordFieldSummary = ({
  recordField: { relationAggregateOperation, relationTargetFieldMetadataId },
  relationObjectMetadataItem,
}: {
  recordField: Pick<
    RecordField,
    'relationAggregateOperation' | 'relationTargetFieldMetadataId'
  >;
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'readableFields'
  >;
}): RecordFieldSummary | undefined => {
  if (!isDefined(relationAggregateOperation)) {
    return undefined;
  }

  if (relationAggregateOperation === AggregateOperations.COUNT) {
    return {
      aggregateOperation: AggregateOperations.COUNT,
      aggregateGqlFieldName: 'totalCount',
      isAggregatedFieldReadable: true,
    };
  }

  // Found among all fields so a field the user cannot read still makes a summary, shown as forbidden
  const aggregatedFieldMetadataItem = isDefined(relationTargetFieldMetadataId)
    ? relationObjectMetadataItem.fields.find(
        findById(relationTargetFieldMetadataId),
      )
    : undefined;

  if (
    !isDefined(aggregatedFieldMetadataItem) ||
    !getSummaryAggregateOperations(aggregatedFieldMetadataItem).includes(
      relationAggregateOperation,
    )
  ) {
    return undefined;
  }

  const aggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      relationAggregateOperation,
      aggregatedFieldMetadataItem.type,
    );

  const aggregateGqlFieldName = getAvailableAggregationsFromObjectFields([
    aggregatedFieldMetadataItem,
  ])[aggregatedFieldMetadataItem.name]?.[aggregateOperation];

  if (!isDefined(aggregateGqlFieldName)) {
    return undefined;
  }

  return {
    aggregateOperation,
    aggregatedFieldMetadataItem,
    aggregateGqlFieldName,
    isAggregatedFieldReadable: relationObjectMetadataItem.readableFields.some(
      findById(aggregatedFieldMetadataItem.id),
    ),
  };
};
