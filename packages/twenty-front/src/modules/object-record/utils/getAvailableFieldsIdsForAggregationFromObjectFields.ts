import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { initializeAvailableFieldsForAggregateOperationMap } from '@/object-record/utils/initializeAvailableFieldsForAggregateOperationMap';
import { isDefined } from '~/utils/isDefined';

export const getAvailableFieldsIdsForAggregationFromObjectFields = (
  fields: FieldMetadataItem[],
  targetAggregateOperations: ExtendedAggregateOperations[],
): AvailableFieldsForAggregateOperation => {
  const aggregationMap = initializeAvailableFieldsForAggregateOperationMap(
    targetAggregateOperations,
  );

  const allAggregations = getAvailableAggregationsFromObjectFields(fields);

  return fields.reduce((acc, field) => {
    if (isDefined(allAggregations[field.name])) {
      Object.keys(allAggregations[field.name]).forEach((aggregation) => {
        const typedAggregation = aggregation as ExtendedAggregateOperations;
        if (targetAggregateOperations.includes(typedAggregation)) {
          if (!isDefined(acc[typedAggregation])) {
            acc[typedAggregation] = [];
          }
          (acc[typedAggregation] as string[]).push(field.id);
        }
      });
    }
    return acc;
  }, aggregationMap);
};
