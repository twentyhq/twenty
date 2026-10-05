import { GraphQLInt } from 'graphql';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { countDistinctAggregates } from 'src/engine/api/common/common-query-runners/utils/count-distinct-aggregates.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

const buildAggregationField = (
  aggregateOperation: AggregateOperations,
): AggregationField => ({
  type: GraphQLInt,
  description: '',
  fromField: 'name',
  fromFieldType: FieldMetadataType.TEXT,
  aggregateOperation,
});

describe('countDistinctAggregates', () => {
  it('should count only the count unique values aggregates', () => {
    expect(
      countDistinctAggregates({
        totalCount: buildAggregationField(AggregateOperations.COUNT),
        countUniqueValuesName: buildAggregationField(
          AggregateOperations.COUNT_UNIQUE_VALUES,
        ),
        countUniqueValuesCity: buildAggregationField(
          AggregateOperations.COUNT_UNIQUE_VALUES,
        ),
      }),
    ).toBe(2);
  });

  it('should count nothing without aggregates', () => {
    expect(countDistinctAggregates(undefined)).toBe(0);
  });
});
