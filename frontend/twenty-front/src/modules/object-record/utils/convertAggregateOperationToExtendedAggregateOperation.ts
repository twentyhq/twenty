import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export const convertAggregateOperationToExtendedAggregateOperation = (
  aggregateOperation: AggregateOperations,
  fieldType?: FieldMetadataType,
): ExtendedAggregateOperations => {
  if (isFieldMetadataDateKind(fieldType) === true) {
    if (aggregateOperation === AggregateOperations.MIN) {
      return DateAggregateOperations.EARLIEST;
    }
    if (aggregateOperation === AggregateOperations.MAX) {
      return DateAggregateOperations.LATEST;
    }
  }
  return aggregateOperation;
};
