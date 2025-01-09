import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
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
        if (
          targetAggregateOperations.includes(
            aggregation as AGGREGATE_OPERATIONS,
          )
        ) {
          const convertedAggregateOperation: ExtendedAggregateOperations =
            convertAggregateOperationToExtendedAggregateOperation(
              aggregation as AGGREGATE_OPERATIONS,
              field.type,
            );
          if (!isDefined(acc[convertedAggregateOperation])) {
            acc[convertedAggregateOperation] = [];
          }
          (acc[convertedAggregateOperation] as string[]).push(field.id);
        }
      });
    }
    return acc;
  }, aggregationMap);
};
