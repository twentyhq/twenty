import { AggregateOperations } from 'twenty-shared/types';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

export const resolveAggregateFieldKey = (
  aggregateOperation: keyof typeof AggregateOperations,
  aggregateFieldName: string,
  availableAggregations: Record<string, AggregationField>,
): string | null => {
  const [parentField, subField] = aggregateFieldName.includes('.')
    ? aggregateFieldName.split('.')
    : [aggregateFieldName, undefined];

  const targetOperation = AggregateOperations[aggregateOperation];

  const matchingEntry = Object.entries(availableAggregations).find(
    ([, aggregation]) => {
      if (aggregation.aggregateOperation !== targetOperation) {
        return false;
      }

      if (aggregation.fromField !== parentField) {
        return false;
      }

      if (subField) {
        return aggregation.subFieldForNumericOperation === subField;
      }

      return true;
    },
  );

  return matchingEntry?.[0] ?? null;
};
