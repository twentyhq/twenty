import { GraphQLFloat } from 'graphql';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';

describe('ProcessAggregateHelper.getAggregateExpression', () => {
  it('should cast rating enum values to integers for numeric operations', () => {
    expect(
      ProcessAggregateHelper.getAggregateExpression(
        {
          type: GraphQLFloat,
          description: '',
          fromField: 'score',
          fromFieldType: FieldMetadataType.RATING,
          aggregateOperation: AggregateOperations.AVG,
        },
        'company',
      ),
    ).toBe(`AVG(CAST(SPLIT_PART("company"."score"::text, '_', 2) AS INTEGER))`);
  });

  it('should aggregate number columns directly', () => {
    expect(
      ProcessAggregateHelper.getAggregateExpression(
        {
          type: GraphQLFloat,
          description: '',
          fromField: 'employees',
          fromFieldType: FieldMetadataType.NUMBER,
          aggregateOperation: AggregateOperations.MAX,
        },
        'company',
      ),
    ).toBe(`MAX("company"."employees")`);
  });
});
