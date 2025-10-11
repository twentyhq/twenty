import { registerEnumType } from '@nestjs/graphql';

import { AggregateOperations } from './aggregate-operations.constant';

export enum ExtendedAggregateOperations {
  MIN = AggregateOperations.MIN,
  MAX = AggregateOperations.MAX,
  AVG = AggregateOperations.AVG,
  SUM = AggregateOperations.SUM,
  COUNT = AggregateOperations.COUNT,
  COUNT_UNIQUE_VALUES = AggregateOperations.COUNT_UNIQUE_VALUES,
  COUNT_EMPTY = AggregateOperations.COUNT_EMPTY,
  COUNT_NOT_EMPTY = AggregateOperations.COUNT_NOT_EMPTY,
  COUNT_TRUE = AggregateOperations.COUNT_TRUE,
  COUNT_FALSE = AggregateOperations.COUNT_FALSE,
  PERCENTAGE_EMPTY = AggregateOperations.PERCENTAGE_EMPTY,
  PERCENTAGE_NOT_EMPTY = AggregateOperations.PERCENTAGE_NOT_EMPTY,
  EARLIEST = 'EARLIEST',
  LATEST = 'LATEST',
}

registerEnumType(ExtendedAggregateOperations, {
  name: 'ExtendedAggregateOperations',
});
