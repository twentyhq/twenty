import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { GraphOrderBy } from '~/generated/graphql';
import { fillDateGapsInBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInBarChartData';

describe('fillDateGapsInBarChartData', () => {
  describe('one-dimensional data', () => {
    it('fills gaps in date data with zero values', () => {
      const data = [
        {
          groupByDimensionValues: ['2024-01-01'],
          count: 5,
        },
        {
          groupByDimensionValues: ['2024-01-03'],
          count: 3,
        },
      ];

      const result = fillDateGapsInBarChartData({
        data,
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toEqual({
        groupByDimensionValues: ['2024-01-01'],
        count: 5,
      });
      expect(result.data[1]).toEqual({
        groupByDimensionValues: ['2024-01-02'],
        count: 0,
      });
      expect(result.data[2]).toEqual({
        groupByDimensionValues: ['2024-01-03'],
        count: 3,
      });
      expect(result.wasTruncated).toBe(false);
    });

    it('returns empty data unchanged', () => {
      const result = fillDateGapsInBarChartData({
        data: [],
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(result.data).toEqual([]);
      expect(result.wasTruncated).toBe(false);
    });

    it('returns data in descending order when orderBy is FIELD_DESC', () => {
      const data = [
        {
          groupByDimensionValues: ['2024-01-01'],
          count: 5,
        },
        {
          groupByDimensionValues: ['2024-01-03'],
          count: 3,
        },
      ];

      const result = fillDateGapsInBarChartData({
        data,
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        orderBy: GraphOrderBy.FIELD_DESC,
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toEqual({
        groupByDimensionValues: ['2024-01-03'],
        count: 3,
      });
      expect(result.data[1]).toEqual({
        groupByDimensionValues: ['2024-01-02'],
        count: 0,
      });
      expect(result.data[2]).toEqual({
        groupByDimensionValues: ['2024-01-01'],
        count: 5,
      });
      expect(result.wasTruncated).toBe(false);
    });

    it('returns data in ascending order when orderBy is FIELD_ASC', () => {
      const data = [
        {
          groupByDimensionValues: ['2024-01-01'],
          count: 5,
        },
        {
          groupByDimensionValues: ['2024-01-03'],
          count: 3,
        },
      ];

      const result = fillDateGapsInBarChartData({
        data,
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        orderBy: GraphOrderBy.FIELD_ASC,
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toEqual({
        groupByDimensionValues: ['2024-01-01'],
        count: 5,
      });
      expect(result.data[1]).toEqual({
        groupByDimensionValues: ['2024-01-02'],
        count: 0,
      });
      expect(result.data[2]).toEqual({
        groupByDimensionValues: ['2024-01-03'],
        count: 3,
      });
      expect(result.wasTruncated).toBe(false);
    });
  });

  describe('two-dimensional data', () => {
    it('fills gaps for all second dimension values', () => {
      const data = [
        {
          groupByDimensionValues: ['2024-01-01', 'A'],
          count: 5,
        },
        {
          groupByDimensionValues: ['2024-01-03', 'A'],
          count: 3,
        },
        {
          groupByDimensionValues: ['2024-01-01', 'B'],
          count: 2,
        },
      ];

      const result = fillDateGapsInBarChartData({
        data,
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        hasSecondDimension: true,
      });

      expect(result.data).toHaveLength(6);
      expect(
        result.data.filter((r) => r.groupByDimensionValues[1] === 'A'),
      ).toHaveLength(3);
      expect(
        result.data.filter((r) => r.groupByDimensionValues[1] === 'B'),
      ).toHaveLength(3);
      expect(
        result.data.find(
          (r) =>
            r.groupByDimensionValues[0] === '2024-01-02' &&
            r.groupByDimensionValues[1] === 'A',
        ),
      ).toEqual({
        groupByDimensionValues: ['2024-01-02', 'A'],
        count: 0,
      });
      expect(result.wasTruncated).toBe(false);
    });

    it('fills gaps in descending order when orderBy is FIELD_DESC', () => {
      const data = [
        {
          groupByDimensionValues: ['2024-01-01', 'A'],
          count: 5,
        },
        {
          groupByDimensionValues: ['2024-01-03', 'A'],
          count: 3,
        },
        {
          groupByDimensionValues: ['2024-01-01', 'B'],
          count: 2,
        },
      ];

      const result = fillDateGapsInBarChartData({
        data,
        keys: ['count'],
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        hasSecondDimension: true,
        orderBy: GraphOrderBy.FIELD_DESC,
      });

      expect(result.data).toHaveLength(6);

      // First date group should be Jan 3 (descending)
      expect(result.data[0].groupByDimensionValues[0]).toBe('2024-01-03');
      expect(result.data[1].groupByDimensionValues[0]).toBe('2024-01-03');

      // Middle date group should be Jan 2
      expect(result.data[2].groupByDimensionValues[0]).toBe('2024-01-02');
      expect(result.data[3].groupByDimensionValues[0]).toBe('2024-01-02');

      // Last date group should be Jan 1
      expect(result.data[4].groupByDimensionValues[0]).toBe('2024-01-01');
      expect(result.data[5].groupByDimensionValues[0]).toBe('2024-01-01');

      expect(result.wasTruncated).toBe(false);
    });
  });
});
