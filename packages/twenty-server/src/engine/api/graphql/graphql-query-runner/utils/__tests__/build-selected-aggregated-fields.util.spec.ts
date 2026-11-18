import { GraphQLInt } from 'graphql';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { buildSelectedAggregatedFields } from 'src/engine/api/graphql/graphql-query-runner/utils/build-selected-aggregated-fields.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

const TOTAL_COUNT: AggregationField = {
  type: GraphQLInt,
  description: 'Total number of records in the connection',
  fromField: 'id',
  fromFieldType: FieldMetadataType.UUID,
  aggregateOperation: AggregateOperations.COUNT,
};

describe('buildSelectedAggregatedFields', () => {
  it('should nest each relation aggregates under its key, recursively', () => {
    expect(
      buildSelectedAggregatedFields({
        columns: { id: true },
        aggregates: { totalCount: TOTAL_COUNT },
        relations: {
          people: {
            fieldName: 'people',
            selection: {
              columns: { id: true },
              aggregates: { totalCount: TOTAL_COUNT },
              relations: {
                company: {
                  fieldName: 'company',
                  selection: {
                    columns: { id: true },
                    aggregates: {},
                    relations: {},
                  },
                },
              },
            },
          },
        },
      }),
    ).toEqual({
      totalCount: TOTAL_COUNT,
      people: { totalCount: TOTAL_COUNT, company: {} },
    });
  });
});
