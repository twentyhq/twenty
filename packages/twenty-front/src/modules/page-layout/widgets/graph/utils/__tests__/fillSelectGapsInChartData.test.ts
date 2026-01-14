import { fillSelectGapsInChartData } from '@/page-layout/widgets/graph/utils/fillSelectGapsInChartData';

describe('fillSelectGapsInChartData', () => {
  const selectOptions = [
    { id: '1', label: 'Option A', value: 'A', position: 0, color: 'green' },
    { id: '2', label: 'Option B', value: 'B', position: 1, color: 'blue' },
    { id: '3', label: 'Option C', value: 'C', position: 2, color: 'red' },
  ] as const;

  describe('one-dimensional data', () => {
    it('returns data unchanged when selectOptions is undefined', () => {
      const data = [
        { groupByDimensionValues: ['A'], count: 5 },
        { groupByDimensionValues: ['B'], count: 3 },
      ];

      const result = fillSelectGapsInChartData({
        data,
        selectOptions: undefined,
        aggregateKeys: ['count'],
      });

      expect(result).toEqual(data);
    });

    it('returns data unchanged when selectOptions is null', () => {
      const data = [
        { groupByDimensionValues: ['A'], count: 5 },
        { groupByDimensionValues: ['B'], count: 3 },
      ];

      const result = fillSelectGapsInChartData({
        data,
        selectOptions: null,
        aggregateKeys: ['count'],
      });

      expect(result).toEqual(data);
    });

    it('returns data unchanged when selectOptions is empty', () => {
      const data = [
        { groupByDimensionValues: ['A'], count: 5 },
        { groupByDimensionValues: ['B'], count: 3 },
      ];

      const result = fillSelectGapsInChartData({
        data,
        selectOptions: [],
        aggregateKeys: ['count'],
      });

      expect(result).toEqual(data);
    });

    it('returns empty data unchanged', () => {
      const result = fillSelectGapsInChartData({
        data: [],
        selectOptions: [...selectOptions],
        aggregateKeys: ['count'],
      });

      expect(result).toEqual([]);
    });

    it('fills missing select options with zero values', () => {
      const data = [
        { groupByDimensionValues: ['A'], count: 5 },
        { groupByDimensionValues: ['C'], count: 3 },
      ];

      const result = fillSelectGapsInChartData({
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
  });

  describe('two-dimensional data', () => {
    it('fills missing primary axis options for all secondary values', () => {
      const data = [
        { groupByDimensionValues: ['A', 'X'], count: 5 },
        { groupByDimensionValues: ['C', 'X'], count: 3 },
        { groupByDimensionValues: ['A', 'Y'], count: 2 },
      ];

      const result = fillSelectGapsInChartData({
        data,
        selectOptions: [...selectOptions],
        aggregateKeys: ['count'],
        hasSecondDimension: true,
      });

      expect(result).toHaveLength(6);

      expect(
        result.filter((r) => r.groupByDimensionValues[0] === 'A'),
      ).toHaveLength(2);
      expect(
        result.filter((r) => r.groupByDimensionValues[0] === 'B'),
      ).toHaveLength(2);
      expect(
        result.filter((r) => r.groupByDimensionValues[0] === 'C'),
      ).toHaveLength(2);

      expect(
        result.find(
          (r) =>
            r.groupByDimensionValues[0] === 'B' &&
            r.groupByDimensionValues[1] === 'X',
        ),
      ).toEqual({
        groupByDimensionValues: ['B', 'X'],
        count: 0,
      });
    });
  });
});
