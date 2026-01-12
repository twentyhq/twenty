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

    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual({
      groupByDimensionValues: ['A'],
      count: 5,
    });
    expect(result.data[1]).toEqual({
      groupByDimensionValues: ['B'],
      count: 0,
    });
    expect(result.data[2]).toEqual({
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

    expect(result.data).toHaveLength(3);
    expect(result.data).toEqual(data);
  });

  it('orders results by option position', () => {
    const data = [
      { groupByDimensionValues: ['C'], count: 3 },
      { groupByDimensionValues: ['A'], count: 5 },
    ];

    const result = fillSelectGapsInOneDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    expect(result.data).toHaveLength(3);
    expect(result.data[0].groupByDimensionValues[0]).toBe('A');
    expect(result.data[1].groupByDimensionValues[0]).toBe('B');
    expect(result.data[2].groupByDimensionValues[0]).toBe('C');
  });

  it('works with multiple aggregate keys', () => {
    const data = [{ groupByDimensionValues: ['A'], count: 5, sum: 100 }];

    const result = fillSelectGapsInOneDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count', 'sum'],
    });

    expect(result.data).toHaveLength(3);
    expect(result.data[1]).toEqual({
      groupByDimensionValues: ['B'],
      count: 0,
      sum: 0,
    });
  });

  it('handles options with non-sequential positions', () => {
    const unsortedOptions = [
      { id: '1', label: 'Option A', value: 'A', position: 10, color: 'green' },
      { id: '2', label: 'Option B', value: 'B', position: 5, color: 'blue' },
      { id: '3', label: 'Option C', value: 'C', position: 20, color: 'red' },
    ] as const;

    const data = [{ groupByDimensionValues: ['A'], count: 5 }];

    const result = fillSelectGapsInOneDimensionalChartData({
      data,
      selectOptions: [...unsortedOptions],
      aggregateKeys: ['count'],
    });

    expect(result.data).toHaveLength(3);
    expect(result.data[0].groupByDimensionValues[0]).toBe('B');
    expect(result.data[1].groupByDimensionValues[0]).toBe('A');
    expect(result.data[2].groupByDimensionValues[0]).toBe('C');
  });
});
