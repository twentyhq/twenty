import { GraphQLFloat, GraphQLInt } from 'graphql';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { resolveAggregateFieldKey } from 'src/engine/core-modules/record-crud/utils/resolve-aggregate-field-key.util';

const availableAggregations: Record<string, AggregationField> = {
  totalCount: {
    type: GraphQLInt,
    description: 'Total count',
    fromField: '*',
    fromFieldType: FieldMetadataType.UUID,
    aggregateOperation: AggregateOperations.COUNT,
  },
  sumEmployees: {
    type: GraphQLFloat,
    description: 'Sum of employees',
    fromField: 'employees',
    fromFieldType: FieldMetadataType.NUMBER,
    aggregateOperation: AggregateOperations.SUM,
  },
  avgEmployees: {
    type: GraphQLFloat,
    description: 'Average of employees',
    fromField: 'employees',
    fromFieldType: FieldMetadataType.NUMBER,
    aggregateOperation: AggregateOperations.AVG,
  },
  sumAmountAmountMicros: {
    type: GraphQLFloat,
    description: 'Sum of amount',
    fromField: 'amount',
    fromFieldType: FieldMetadataType.CURRENCY,
    fromSubFields: ['amountMicros', 'currencyCode'],
    subFieldForNumericOperation: 'amountMicros',
    aggregateOperation: AggregateOperations.SUM,
  },
  avgAmountAmountMicros: {
    type: GraphQLFloat,
    description: 'Average of amount',
    fromField: 'amount',
    fromFieldType: FieldMetadataType.CURRENCY,
    fromSubFields: ['amountMicros', 'currencyCode'],
    subFieldForNumericOperation: 'amountMicros',
    aggregateOperation: AggregateOperations.AVG,
  },
};

describe('resolveAggregateFieldKey', () => {
  it('resolves a simple NUMBER field', () => {
    expect(
      resolveAggregateFieldKey('SUM', 'employees', availableAggregations),
    ).toBe('sumEmployees');
  });

  it('resolves a CURRENCY field with dot notation', () => {
    expect(
      resolveAggregateFieldKey(
        'SUM',
        'amount.amountMicros',
        availableAggregations,
      ),
    ).toBe('sumAmountAmountMicros');
  });

  it('resolves a CURRENCY field with just the parent name', () => {
    expect(
      resolveAggregateFieldKey('SUM', 'amount', availableAggregations),
    ).toBe('sumAmountAmountMicros');
  });

  it('rejects an invalid sub-field for a composite type', () => {
    expect(
      resolveAggregateFieldKey(
        'SUM',
        'amount.currencyCode',
        availableAggregations,
      ),
    ).toBeNull();
  });

  it('rejects invalid multi-level dot notation', () => {
    expect(
      resolveAggregateFieldKey(
        'SUM',
        'amount.amountMicros.extra',
        availableAggregations,
      ),
    ).toBeNull();
  });

  it('returns null for a non-existent field', () => {
    expect(
      resolveAggregateFieldKey('SUM', 'nonExistent', availableAggregations),
    ).toBeNull();
  });

  it('matches the correct operation when multiple exist for the same field', () => {
    expect(
      resolveAggregateFieldKey('AVG', 'employees', availableAggregations),
    ).toBe('avgEmployees');

    expect(
      resolveAggregateFieldKey(
        'AVG',
        'amount.amountMicros',
        availableAggregations,
      ),
    ).toBe('avgAmountAmountMicros');
  });
});
