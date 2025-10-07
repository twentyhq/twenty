import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { type ExtendedAggregateOperations as FrontendExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { ExtendedAggregateOperations as GraphQLExtendedAggregateOperations } from '~/generated-metadata/graphql';

const AGGREGATE_OPERATION_MAPPING: Record<
  FrontendExtendedAggregateOperations,
  GraphQLExtendedAggregateOperations
> = {
  [AggregateOperations.MIN]: GraphQLExtendedAggregateOperations.MIN,
  [AggregateOperations.MAX]: GraphQLExtendedAggregateOperations.MAX,
  [AggregateOperations.AVG]: GraphQLExtendedAggregateOperations.AVG,
  [AggregateOperations.SUM]: GraphQLExtendedAggregateOperations.SUM,
  [AggregateOperations.COUNT]: GraphQLExtendedAggregateOperations.COUNT,
  [AggregateOperations.COUNT_EMPTY]:
    GraphQLExtendedAggregateOperations.COUNT_EMPTY,
  [AggregateOperations.COUNT_NOT_EMPTY]:
    GraphQLExtendedAggregateOperations.COUNT_NOT_EMPTY,
  [AggregateOperations.COUNT_UNIQUE_VALUES]:
    GraphQLExtendedAggregateOperations.COUNT_UNIQUE_VALUES,
  [AggregateOperations.PERCENTAGE_EMPTY]:
    GraphQLExtendedAggregateOperations.PERCENTAGE_EMPTY,
  [AggregateOperations.PERCENTAGE_NOT_EMPTY]:
    GraphQLExtendedAggregateOperations.PERCENTAGE_NOT_EMPTY,
  [AggregateOperations.COUNT_TRUE]:
    GraphQLExtendedAggregateOperations.COUNT_TRUE,
  [AggregateOperations.COUNT_FALSE]:
    GraphQLExtendedAggregateOperations.COUNT_FALSE,
  [DateAggregateOperations.EARLIEST]:
    GraphQLExtendedAggregateOperations.EARLIEST,
  [DateAggregateOperations.LATEST]: GraphQLExtendedAggregateOperations.LATEST,
};

export const mapToGraphQLExtendedAggregateOperation = (
  operation: FrontendExtendedAggregateOperations,
): GraphQLExtendedAggregateOperations => {
  return AGGREGATE_OPERATION_MAPPING[operation];
};
