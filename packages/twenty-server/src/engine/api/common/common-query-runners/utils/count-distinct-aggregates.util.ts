import { AggregateOperations } from 'twenty-shared/types';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

export const countDistinctAggregates = (
  aggregate: Record<string, AggregationField> | undefined,
): number =>
  Object.values(aggregate ?? {}).filter(
    (aggregationField) =>
      aggregationField.aggregateOperation ===
      AggregateOperations.COUNT_UNIQUE_VALUES,
  ).length;
