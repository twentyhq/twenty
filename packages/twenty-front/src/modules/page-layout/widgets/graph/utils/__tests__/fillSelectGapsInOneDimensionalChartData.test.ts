import { fillSelectGapsInOneDimensionalChartData } from '@/page-layout/widgets/graph/utils/fillSelectGapsInOneDimensionalChartData';

describe('fillSelectGapsInOneDimensionalChartData', () => {
  const selectOptions = [
    { id: '1', label: 'Option A', value: 'A', position: 0, color: 'green' },
    { id: '2', label: 'Option B', value: 'B', position: 1, color: 'blue' },
    { id: '3', label: 'Option C', value: 'C', position: 2, color: 'red' },
  ] as const;

  it('fills missing select options with zero values', () => {
    const data = [
      { groupByDimensionValues: ['A'], count: 5 },
      { groupByDimensionValues: ['C'], count: 3 },
    ];

    const result = fillSelectGapsInOneDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      groupByDimensionValues: ['A'],
      count: 5,
    });
    expect(result[1]).toEqual({
      groupByDimensionValues: ['B'],
      count: 0,
    });
    expect(result[2]).toEqual({
      groupByDimensionValues: ['C'],
      count: 3,
    });
  });

  it('preserves existing data values', () => {
    const data = [
      { groupByDimensionValues: ['A'], count: 10, sum: 100 },
      { groupByDimensionValues: ['B'], count: 20, sum: 200 },
      { groupByDimensionValues: ['C'], count: 30, sum: 300 },
    ];

    const result = fillSelectGapsInOneDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count', 'sum'],
    });

    expect(result).toHaveLength(3);
    expect(result).toEqual(data);
  });

  it('preserves selectOptions order', () => {
    const data = [
      { groupByDimensionValues: ['C'], count: 3 },
      { groupByDimensionValues: ['A'], count: 5 },
    ];

    const result = fillSelectGapsInOneDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    expect(result).toHaveLength(3);
    expect(result[0].groupByDimensionValues[0]).toBe('A');
    expect(result[1].groupByDimensionValues[0]).toBe('B');
    expect(result[2].groupByDimensionValues[0]).toBe('C');
  });

  it('works with multiple aggregate keys', () => {
    const data = [{ groupByDimensionValues: ['A'], count: 5, sum: 100 }];

    const result = fillSelectGapsInOneDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count', 'sum'],
    });

    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({
      groupByDimensionValues: ['B'],
      count: 0,
      sum: 0,
    });
  });
});
