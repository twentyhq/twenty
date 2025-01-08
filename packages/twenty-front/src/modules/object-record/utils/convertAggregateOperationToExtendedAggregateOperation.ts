import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const convertAggregateOperationToExtendedAggregateOperation = (
  aggregateOperation: AGGREGATE_OPERATIONS,
  fieldType?: FieldMetadataType,
): ExtendedAggregateOperations => {
  if (fieldType === FieldMetadataType.DateTime) {
    if (aggregateOperation === AGGREGATE_OPERATIONS.min) {
      return 'EARLIEST';
    }
    if (aggregateOperation === AGGREGATE_OPERATIONS.max) {
      return 'LATEST';
    }
  }
  return aggregateOperation;
};
