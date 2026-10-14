import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

// Raw rows carry traversed aggregates under "relation.aggregation"; the connection exposes them as { relation: { aggregation } }
export const formatAggregatedFieldsValues = ({
  selectedAggregatedFields,
  aggregatedValues,
}: {
  selectedAggregatedFields: Record<string, AggregationField>;
  aggregatedValues: Record<string, unknown>;
}): Record<string, unknown> => {
  return Object.entries(selectedAggregatedFields).reduce<
    Record<string, unknown>
  >((acc, [aggregatedFieldName, aggregatedField]) => {
    // A nested relation entry holds the relation's own aggregate map and shares its key with the traversed relation name
    if (
      !isDefined(aggregatedField?.aggregateOperation) ||
      !(aggregatedFieldName in aggregatedValues)
    ) {
      return acc;
    }

    const aggregatedValue = aggregatedValues[aggregatedFieldName];
    const throughRelation = aggregatedField.throughRelation;

    if (!isDefined(throughRelation)) {
      acc[aggregatedFieldName] = aggregatedValue;

      return acc;
    }

    const relationAggregatedValues = acc[throughRelation.relationFieldName];

    acc[throughRelation.relationFieldName] = {
      ...(isPlainObject(relationAggregatedValues)
        ? relationAggregatedValues
        : {}),
      [throughRelation.targetAggregationName]: aggregatedValue,
    };

    return acc;
  }, {});
};
