import { formatResultWithGroupByDimensionValues } from '../format-result-with-group-by-dimension-values.util';

describe('formatResultWithGroupByDimensionValues', () => {
  it('should convert NaN values to null in group results', () => {
    const result = [
      {
        city: 'Paris',
        avgEmployees: NaN,
        totalCount: 5,
        maxRevenue: 100000,
      },
      {
        city: 'London',
        avgEmployees: 25,
        totalCount: 3,
        maxRevenue: NaN,
      },
    ];

    const groupByColumnsWithQuotes = [
      {
        columnNameWithQuotes: '"city"',
        alias: 'city',
      },
    ];

    const formatted = formatResultWithGroupByDimensionValues(
      result,
      groupByColumnsWithQuotes,
    );

    expect(formatted).toHaveLength(2);
    expect(formatted[0]).toMatchObject({
      city: 'Paris',
      avgEmployees: null, // NaN should be converted to null
      totalCount: 5,
      maxRevenue: 100000,
    });
    expect(formatted[1]).toMatchObject({
      city: 'London',
      avgEmployees: 25,
      totalCount: 3,
      maxRevenue: null, // NaN should be converted to null
    });
  });

  it('should handle normal numeric values correctly', () => {
    const result = [
      {
        category: 'A',
        avgValue: 42.5,
        minValue: 0,
        maxValue: -10.5,
        totalCount: 100,
      },
    ];

    const groupByColumnsWithQuotes = [
      {
        columnNameWithQuotes: '"category"',
        alias: 'category',
      },
    ];

    const formatted = formatResultWithGroupByDimensionValues(
      result,
      groupByColumnsWithQuotes,
    );

    expect(formatted).toHaveLength(1);
    expect(formatted[0]).toMatchObject({
      category: 'A',
      avgValue: 42.5,
      minValue: 0, // Zero should pass through
      maxValue: -10.5, // Negative values should pass through
      totalCount: 100,
    });
  });

  it('should handle null and undefined values correctly', () => {
    const result = [
      {
        region: 'North',
        avgRevenue: null,
        maxProfit: undefined,
        totalCount: 0,
      },
    ];

    const groupByColumnsWithQuotes = [
      {
        columnNameWithQuotes: '"region"',
        alias: 'region',
      },
    ];

    const formatted = formatResultWithGroupByDimensionValues(
      result,
      groupByColumnsWithQuotes,
    );

    expect(formatted).toHaveLength(1);
    expect(formatted[0]).toMatchObject({
      region: 'North',
      avgRevenue: null, // null should pass through
      maxProfit: undefined, // undefined should pass through
      totalCount: 0,
    });
  });
});
