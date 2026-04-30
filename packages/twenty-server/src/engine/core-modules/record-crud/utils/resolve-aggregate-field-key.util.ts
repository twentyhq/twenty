import { AggregateOperations } from 'twenty-shared/types';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

export const resolveAggregateFieldKey = (
  aggregateOperation: keyof typeof AggregateOperations,
  aggregateFieldName: string,
  availableAggregations: Record<string, AggregationField>,
): string | null => {
  // Tool inputs use (aggregateOperation, aggregateFieldName), while GraphQL/REST
  // already pass concrete aggregate keys (e.g. "sumEmployees"), so this helper
  // intentionally adapts only the tool-surface contract.
  const fieldPathParts = aggregateFieldName.split('.');

  if (
    fieldPathParts.length > 2 ||
    fieldPathParts.some((fieldPathPart) => fieldPathPart.length === 0)
  ) {
    return null;
  }

  const [parentField, subField] = fieldPathParts;

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
