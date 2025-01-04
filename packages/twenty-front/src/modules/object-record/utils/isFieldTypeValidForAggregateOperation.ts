import { FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldsAvailableByAggregateOperation';
import { AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTypeValidForAggregateOperation = (
  fieldType: FieldMetadataType,
  aggregateOperation: AggregateOperationsOmittingStandardOperations,
): boolean => {
  return FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION[aggregateOperation].includes(
    fieldType,
  );
};
