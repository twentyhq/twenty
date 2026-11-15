import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { isDefined } from 'twenty-shared/utils';

// The server accepts only these on related records; Count takes no field
const RELATION_AGGREGATE_OPERATIONS = [
  AggregateOperations.SUM,
  AggregateOperations.AVG,
  AggregateOperations.MIN,
  AggregateOperations.MAX,
];

export const getRelationAggregateOperations = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  const availableAggregations =
    getAvailableAggregationsFromObjectFields([fieldMetadataItem])[
      fieldMetadataItem.name
    ] ?? {};

  return RELATION_AGGREGATE_OPERATIONS.filter((aggregateOperation) =>
    isDefined(
      availableAggregations[
        convertAggregateOperationToExtendedAggregateOperation(
          aggregateOperation,
          fieldMetadataItem.type,
        )
      ],
    ),
  );
};
