import { FieldMetadataType } from 'twenty-shared/types';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';

export const computeIsNumericReturningAggregate = (
  operation: AggregateOperations,
  fromFieldType: FieldMetadataType,
): boolean => {
  if (
    operation === AggregateOperations.COUNT ||
    operation === AggregateOperations.COUNT_UNIQUE_VALUES ||
    operation === AggregateOperations.COUNT_EMPTY ||
    operation === AggregateOperations.COUNT_NOT_EMPTY ||
    operation === AggregateOperations.COUNT_TRUE ||
    operation === AggregateOperations.COUNT_FALSE ||
    operation === AggregateOperations.PERCENTAGE_EMPTY ||
    operation === AggregateOperations.PERCENTAGE_NOT_EMPTY
  ) {
    return true;
  }

  if (
    operation === AggregateOperations.MIN ||
    operation === AggregateOperations.MAX ||
    operation === AggregateOperations.AVG ||
    operation === AggregateOperations.SUM
  ) {
    return [
      FieldMetadataType.NUMBER,
      FieldMetadataType.NUMERIC,
      FieldMetadataType.CURRENCY,
    ].includes(fromFieldType);
  }

  return false;
};
