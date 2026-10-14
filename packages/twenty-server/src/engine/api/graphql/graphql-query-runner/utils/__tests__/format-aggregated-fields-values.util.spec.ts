import { GraphQLFloat, GraphQLInt } from 'graphql';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { formatAggregatedFieldsValues } from 'src/engine/api/graphql/graphql-query-runner/utils/format-aggregated-fields-values.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

const totalCount: AggregationField = {
  type: GraphQLInt,
  description: '',
  fromField: 'id',
  fromFieldType: FieldMetadataType.UUID,
  aggregateOperation: AggregateOperations.COUNT,
};

const buildThroughCompany = (targetAggregationName: string): AggregationField =>
  ({
    type: GraphQLFloat,
    description: '',
    fromField: 'employees',
    fromFieldType: FieldMetadataType.NUMBER,
    aggregateOperation: AggregateOperations.SUM,
    throughRelation: {
      relationFieldName: 'company',
      targetAggregationName,
    },
  }) as AggregationField;

describe('formatAggregatedFieldsValues', () => {
  it('should nest traversed aggregates under their relation name', () => {
    expect(
      formatAggregatedFieldsValues({
        selectedAggregatedFields: {
          totalCount,
          'company.sumEmployees': buildThroughCompany('sumEmployees'),
          'company.avgEmployees': buildThroughCompany('avgEmployees'),
        },
        aggregatedValues: {
          totalCount: '4',
          'company.sumEmployees': 60,
          'company.avgEmployees': 20,
        },
      }),
    ).toEqual({
      totalCount: '4',
      company: { sumEmployees: 60, avgEmployees: 20 },
    });
  });

  it('should ignore a nested relation aggregate map sharing the relation name', () => {
    // The node-level relation parser stores the relation's own aggregates under the same key
    expect(
      formatAggregatedFieldsValues({
        selectedAggregatedFields: {
          'company.sumEmployees': buildThroughCompany('sumEmployees'),
          company: {} as AggregationField,
        },
        aggregatedValues: { 'company.sumEmployees': 60, company: {} },
      }),
    ).toEqual({ company: { sumEmployees: 60 } });
  });

  it('should skip aggregates missing from the raw values', () => {
    expect(
      formatAggregatedFieldsValues({
        selectedAggregatedFields: { totalCount },
        aggregatedValues: {},
      }),
    ).toEqual({});
  });
});
