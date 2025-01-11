import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { isFieldMetadataDateKind } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const convertAggregateOperationToExtendedAggregateOperation = (
  aggregateOperation: AGGREGATE_OPERATIONS,
  fieldType?: FieldMetadataType,
): ExtendedAggregateOperations => {
  if (isFieldMetadataDateKind(fieldType) === true) {
    if (aggregateOperation === AGGREGATE_OPERATIONS.min) {
      return DATE_AGGREGATE_OPERATIONS.earliest;
    }
    if (aggregateOperation === AGGREGATE_OPERATIONS.max) {
      return DATE_AGGREGATE_OPERATIONS.latest;
    }
  }
  return aggregateOperation;
};
