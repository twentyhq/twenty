import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldsAvailableByAggregateOperation';
import { AggregateOperationsOmittingCount } from '@/object-record/types/AggregateOperationsOmittingCount';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { initializeAvailableFieldsForAggregateOperationMap } from '@/object-record/utils/initializeAvailableFieldsForAggregateOperationMap';
import { isFieldTypeValidForAggregateOperation } from '@/object-record/utils/isFieldTypeValidForAggregateOperation';

export const getAvailableFieldsIdsForAggregationFromObjectFields = (
  fields: FieldMetadataItem[],
): AvailableFieldsForAggregateOperation => {
  const aggregationMap = initializeAvailableFieldsForAggregateOperationMap();

  return fields.reduce((acc, field) => {
    Object.keys(FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION).forEach(
      (aggregateOperation) => {
        const typedAggregateOperation =
          aggregateOperation as AggregateOperationsOmittingCount;

        if (
          isFieldTypeValidForAggregateOperation(
            field.type,
            typedAggregateOperation,
          )
        ) {
          acc[typedAggregateOperation]?.push(field.id);
        }
      },
    );

    return acc;
  }, aggregationMap);
};
