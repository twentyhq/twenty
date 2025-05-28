import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const convertAggregateOperationToExtendedAggregateOperation = (
  aggregateOperation: AggregateOperations,
  fieldType?: FieldMetadataType,
): ExtendedAggregateOperations => {
  if (isFieldMetadataDateKind(fieldType) === true) {
    if (aggregateOperation === AggregateOperations.min) {
      return DATE_AggregateOperations.earliest;
    }
    if (aggregateOperation === AggregateOperations.max) {
      return DATE_AggregateOperations.latest;
    }
  }
  return aggregateOperation;
};
