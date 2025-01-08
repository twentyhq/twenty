import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { initializeAvailableFieldsForAggregateOperationMap } from '@/object-record/utils/initializeAvailableFieldsForAggregateOperationMap';
import { isDefined } from '~/utils/isDefined';

export const getAvailableFieldsIdsForAggregationFromObjectFields = (
  fields: FieldMetadataItem[],
  targetAggregateOperations: AGGREGATE_OPERATIONS[],
): AvailableFieldsForAggregateOperation => {
  const aggregationMap = initializeAvailableFieldsForAggregateOperationMap(
    targetAggregateOperations,
  );

  const allAggregations = getAvailableAggregationsFromObjectFields(fields);

  return fields.reduce((acc, field) => {
    if (isDefined(allAggregations[field.name])) {
      Object.keys(allAggregations[field.name]).forEach((aggregation) => {
        const typedAggregateOperation = aggregation as AGGREGATE_OPERATIONS;

        if (targetAggregateOperations.includes(typedAggregateOperation)) {
          acc[typedAggregateOperation]?.push(field.id);
        }
      });
    }
    return acc;
  }, aggregationMap);
};
