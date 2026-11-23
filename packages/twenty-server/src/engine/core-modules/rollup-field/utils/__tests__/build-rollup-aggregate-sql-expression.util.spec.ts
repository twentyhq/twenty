import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { buildRollupAggregateSqlExpression } from 'src/engine/core-modules/rollup-field/utils/build-rollup-aggregate-sql-expression.util';

describe('buildRollupAggregateSqlExpression', () => {
  it('should count the related records as a number', () => {
    expect(
      buildRollupAggregateSqlExpression({
        settings: {
          aggregateOperation: AggregateOperations.COUNT,
          resultType: FieldMetadataType.NUMBER,
        },
        childObjectNameSingular: 'task',
        aggregatedColumnName: null,
      }),
    ).toBe('(COUNT(*))::double precision');
  });

  it('should aggregate a number column', () => {
    expect(
      buildRollupAggregateSqlExpression({
        settings: {
          aggregateOperation: AggregateOperations.SUM,
          resultType: FieldMetadataType.NUMBER,
        },
        childObjectNameSingular: 'task',
        aggregatedColumnName: 'estimate',
      }),
    ).toBe('(SUM("task"."estimate"))::double precision');
  });

  it('should read a date as text', () => {
    expect(
      buildRollupAggregateSqlExpression({
        settings: {
          aggregateOperation: AggregateOperations.MIN,
          resultType: FieldMetadataType.DATE,
        },
        childObjectNameSingular: 'task',
        aggregatedColumnName: 'startsOn',
      }),
    ).toBe('(MIN("task"."startsOn"))::text');
  });

  it('should read a date and time as a UTC ISO string', () => {
    expect(
      buildRollupAggregateSqlExpression({
        settings: {
          aggregateOperation: AggregateOperations.MAX,
          resultType: FieldMetadataType.DATE_TIME,
        },
        childObjectNameSingular: 'task',
        aggregatedColumnName: 'dueAt',
      }),
    ).toBe(
      `to_char((MAX("task"."dueAt")) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
    );
  });

  it('should escape the identifiers', () => {
    expect(
      buildRollupAggregateSqlExpression({
        settings: {
          aggregateOperation: AggregateOperations.AVG,
          resultType: FieldMetadataType.NUMBER,
        },
        childObjectNameSingular: 'ta"sk',
        aggregatedColumnName: 'esti"mate',
      }),
    ).toBe('(AVG("ta""sk"."esti""mate"))::double precision');
  });
});
