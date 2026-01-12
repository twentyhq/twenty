import { fillSelectGapsInTwoDimensionalChartData } from '@/page-layout/widgets/graph/utils/fillSelectGapsInTwoDimensionalChartData';

describe('fillSelectGapsInTwoDimensionalChartData', () => {
  const selectOptions = [
    { id: '1', label: 'Option A', value: 'A', position: 0, color: 'green' },
    { id: '2', label: 'Option B', value: 'B', position: 1, color: 'blue' },
    { id: '3', label: 'Option C', value: 'C', position: 2, color: 'red' },
  ] as const;

  it('fills missing primary axis options for all secondary values', () => {
    const data = [
      { groupByDimensionValues: ['A', 'X'], count: 5 },
      { groupByDimensionValues: ['C', 'X'], count: 3 },
      { groupByDimensionValues: ['A', 'Y'], count: 2 },
    ];

    const result = fillSelectGapsInTwoDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    expect(result.data).toHaveLength(6);

    expect(
      result.data.filter((r) => r.groupByDimensionValues[0] === 'A'),
    ).toHaveLength(2);
    expect(
      result.data.filter((r) => r.groupByDimensionValues[0] === 'B'),
    ).toHaveLength(2);
    expect(
      result.data.filter((r) => r.groupByDimensionValues[0] === 'C'),
    ).toHaveLength(2);
  });

  it('creates zero-value entries for missing combinations', () => {
    const data = [
      { groupByDimensionValues: ['A', 'X'], count: 5 },
      { groupByDimensionValues: ['C', 'Y'], count: 3 },
    ];

    const result = fillSelectGapsInTwoDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    expect(result.data).toHaveLength(6);

    expect(
      result.data.find(
        (r) =>
          r.groupByDimensionValues[0] === 'B' &&
          r.groupByDimensionValues[1] === 'X',
      ),
    ).toEqual({
      groupByDimensionValues: ['B', 'X'],
      count: 0,
    });

    expect(
      result.data.find(
        (r) =>
          r.groupByDimensionValues[0] === 'A' &&
          r.groupByDimensionValues[1] === 'Y',
      ),
    ).toEqual({
      groupByDimensionValues: ['A', 'Y'],
      count: 0,
    });
  });

  it('preserves existing combinations', () => {
    const data = [
      { groupByDimensionValues: ['A', 'X'], count: 5 },
      { groupByDimensionValues: ['B', 'X'], count: 10 },
      { groupByDimensionValues: ['C', 'X'], count: 15 },
      { groupByDimensionValues: ['A', 'Y'], count: 20 },
      { groupByDimensionValues: ['B', 'Y'], count: 25 },
      { groupByDimensionValues: ['C', 'Y'], count: 30 },
    ];

    const result = fillSelectGapsInTwoDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    expect(result.data).toHaveLength(6);

    expect(
      result.data.find(
        (r) =>
          r.groupByDimensionValues[0] === 'A' &&
          r.groupByDimensionValues[1] === 'X',
      ),
    ).toEqual({
      groupByDimensionValues: ['A', 'X'],
      count: 5,
    });
  });

  it('orders results by primary axis option position', () => {
    const data = [
      { groupByDimensionValues: ['C', 'X'], count: 3 },
      { groupByDimensionValues: ['A', 'X'], count: 5 },
    ];

    const result = fillSelectGapsInTwoDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    const primaryValues = result.data.map((r) => r.groupByDimensionValues[0]);
    const uniquePrimary = [...new Set(primaryValues)];

    expect(uniquePrimary[0]).toBe('A');
    expect(uniquePrimary[1]).toBe('B');
    expect(uniquePrimary[2]).toBe('C');
  });

  it('handles null secondary dimension values', () => {
    const data = [
      { groupByDimensionValues: ['A', null], count: 5 },
      { groupByDimensionValues: ['C', null], count: 3 },
    ];

    const result = fillSelectGapsInTwoDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    expect(result.data).toHaveLength(3);

    expect(
      result.data.find(
        (r) =>
          r.groupByDimensionValues[0] === 'B' &&
          r.groupByDimensionValues[1] === null,
      ),
    ).toEqual({
      groupByDimensionValues: ['B', null],
      count: 0,
    });
  });

  it('does NOT fill missing secondary axis values', () => {
    const data = [
      { groupByDimensionValues: ['A', 'X'], count: 5 },
      { groupByDimensionValues: ['A', 'Y'], count: 3 },
    ];

    const result = fillSelectGapsInTwoDimensionalChartData({
      data,
      selectOptions: [...selectOptions],
      aggregateKeys: ['count'],
    });

    const secondaryValues = result.data.map((r) => r.groupByDimensionValues[1]);
    const uniqueSecondary = [...new Set(secondaryValues)];

    expect(uniqueSecondary).toHaveLength(2);
    expect(uniqueSecondary).toContain('X');
    expect(uniqueSecondary).toContain('Y');
  });
});
