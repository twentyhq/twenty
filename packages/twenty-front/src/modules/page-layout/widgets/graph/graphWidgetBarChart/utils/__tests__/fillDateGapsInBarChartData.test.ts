import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { fillDateGapsInBarChartData } from '../fillDateGapsInBarChartData';

describe('fillDateGapsInBarChartData', () => {
  describe('one-dimensional data', () => {
    it('fills gaps in date data with zero values', () => {
      const data = [
        {
          groupByDimensionValues: ['2024-01-01T00:00:00.000Z'],
          count: 5,
        },
        {
          groupByDimensionValues: ['2024-01-03T00:00:00.000Z'],
          count: 3,
        },
      ];

      const result = fillDateGapsInBarChartData({
        data,
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        groupByDimensionValues: ['2024-01-01T00:00:00.000Z'],
        count: 5,
      });
      expect(result[1]).toEqual({
        groupByDimensionValues: ['2024-01-02T00:00:00.000Z'],
        count: 0,
      });
      expect(result[2]).toEqual({
        groupByDimensionValues: ['2024-01-03T00:00:00.000Z'],
        count: 3,
      });
    });

    it('returns empty data unchanged', () => {
      const result = fillDateGapsInBarChartData({
        data: [],
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result).toEqual([]);
    });
  });

  describe('two-dimensional data', () => {
    it('fills gaps for all second dimension values', () => {
      const data = [
        {
          groupByDimensionValues: ['2024-01-01T00:00:00.000Z', 'A'],
          count: 5,
        },
        {
          groupByDimensionValues: ['2024-01-03T00:00:00.000Z', 'A'],
          count: 3,
        },
        {
          groupByDimensionValues: ['2024-01-01T00:00:00.000Z', 'B'],
          count: 2,
        },
      ];

      const result = fillDateGapsInBarChartData({
        data,
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        hasSecondDimension: true,
      });

      expect(result).toHaveLength(6);
      expect(
        result.filter((r) => r.groupByDimensionValues[1] === 'A'),
      ).toHaveLength(3);
      expect(
        result.filter((r) => r.groupByDimensionValues[1] === 'B'),
      ).toHaveLength(3);
      expect(
        result.find(
          (r) =>
            r.groupByDimensionValues[0] === '2024-01-02T00:00:00.000Z' &&
            r.groupByDimensionValues[1] === 'A',
        ),
      ).toEqual({
        groupByDimensionValues: ['2024-01-02T00:00:00.000Z', 'A'],
        count: 0,
      });
    });
  });
});
