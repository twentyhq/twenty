import { FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldTypesAvailableForNonStandardAggregateOperation';
import { type AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTypeValidForAggregateOperation = (
  fieldType: FieldMetadataType,
  aggregateOperation: AggregateOperationsOmittingStandardOperations,
): boolean => {
  return FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION[
    aggregateOperation
  ].includes(fieldType);
};
