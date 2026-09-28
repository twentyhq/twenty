import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { initializeAvailableFieldsForAggregateOperationMap } from '@/object-record/utils/initializeAvailableFieldsForAggregateOperationMap';
import { isDefined } from 'twenty-shared/utils';

export const getAvailableFieldsIdsForAggregationFromObjectFields = ({
  fields,
  targetAggregateOperations,
}: {
  fields: FieldMetadataItem[];
  targetAggregateOperations: ExtendedAggregateOperations[];
}): AvailableFieldsForAggregateOperation => {
  const aggregationMap = initializeAvailableFieldsForAggregateOperationMap(
    targetAggregateOperations,
  );

  const allAggregations = getAvailableAggregationsFromObjectFields(fields);

  return fields.reduce((acc, field) => {
    const fieldAggregations = allAggregations[field.name];

    if (isDefined(fieldAggregations)) {
      Object.keys(fieldAggregations).forEach((aggregation) => {
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
