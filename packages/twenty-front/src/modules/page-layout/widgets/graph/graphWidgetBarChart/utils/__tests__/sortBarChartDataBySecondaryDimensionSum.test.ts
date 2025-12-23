import { GraphOrderBy } from '~/generated/graphql';
import { sortBarChartDataBySecondaryDimensionSum } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/sortBarChartDataBySecondaryDimensionSum';

describe('sortBarChartDataBySecondaryDimensionSum', () => {
  const mockData = [
    { city: 'Paris', Open: 5, Closed: 10 },
    { city: 'London', Open: 20, Closed: 2 },
    { city: 'Berlin', Open: 8, Closed: 7 },
  ];

  const keys = ['Open', 'Closed'];

  describe('VALUE_DESC sorting', () => {
    it('should sort by totals in descending order', () => {
      const result = sortBarChartDataBySecondaryDimensionSum({
        data: mockData,
        keys,
        orderBy: GraphOrderBy.VALUE_DESC,
      });

      expect(result).toEqual([
        { city: 'London', Open: 20, Closed: 2 },
        { city: 'Paris', Open: 5, Closed: 10 },
        { city: 'Berlin', Open: 8, Closed: 7 },
      ]);
    });
  });

  describe('VALUE_ASC sorting', () => {
    it('should sort by totals in ascending order', () => {
      const result = sortBarChartDataBySecondaryDimensionSum({
        data: mockData,
        keys,
        orderBy: GraphOrderBy.VALUE_ASC,
      });

      expect(result).toEqual([
        { city: 'Paris', Open: 5, Closed: 10 },
        { city: 'Berlin', Open: 8, Closed: 7 },
        { city: 'London', Open: 20, Closed: 2 },
      ]);
    });
  });

  describe('FIELD_ASC/FIELD_DESC (non-value sorting)', () => {
    it('should not sort when orderBy is FIELD_ASC', () => {
      const result = sortBarChartDataBySecondaryDimensionSum({
        data: mockData,
        keys,
        orderBy: GraphOrderBy.FIELD_ASC,
      });

      expect(result).toEqual(mockData);
    });

    it('should not sort when orderBy is FIELD_DESC', () => {
      const result = sortBarChartDataBySecondaryDimensionSum({
        data: mockData,
        keys,
        orderBy: GraphOrderBy.FIELD_DESC,
      });

      expect(result).toEqual(mockData);
    });
  });

  describe('edge cases', () => {
    it('should handle data with missing keys in some items', () => {
      const dataWithMissing = [
        { city: 'Paris', Open: 5 } as any,
        { city: 'London', Open: 20, Closed: 2 },
      ];

      const result = sortBarChartDataBySecondaryDimensionSum({
        data: dataWithMissing,
        keys,
        orderBy: GraphOrderBy.VALUE_DESC,
      });

      expect(result).toEqual([
        { city: 'London', Open: 20, Closed: 2 },
        { city: 'Paris', Open: 5 },
      ]);
    });

    it('should handle data with zero values', () => {
      const dataWithZeros = [
        { city: 'Paris', Open: 0, Closed: 10 },
        { city: 'London', Open: 20, Closed: 0 },
      ];

      const result = sortBarChartDataBySecondaryDimensionSum({
        data: dataWithZeros,
        keys,
        orderBy: GraphOrderBy.VALUE_DESC,
      });

      expect(result).toEqual([
        { city: 'London', Open: 20, Closed: 0 },
        { city: 'Paris', Open: 0, Closed: 10 },
      ]);
    });

    it('should handle empty data array', () => {
      const result = sortBarChartDataBySecondaryDimensionSum({
        data: [],
        keys,
        orderBy: GraphOrderBy.VALUE_DESC,
      });

      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const singleItem = [{ city: 'Paris', Open: 5, Closed: 10 }];

      const result = sortBarChartDataBySecondaryDimensionSum({
        data: singleItem,
        keys,
        orderBy: GraphOrderBy.VALUE_DESC,
      });

      expect(result).toEqual(singleItem);
    });
  });

  describe('stability with equal totals', () => {
    it('should maintain original order for items with equal totals', () => {
      const dataWithEqualTotals = [
        { city: 'Paris', Open: 10, Closed: 5 },
        { city: 'Berlin', Open: 7, Closed: 8 },
        { city: 'Madrid', Open: 9, Closed: 6 },
      ];

      const result = sortBarChartDataBySecondaryDimensionSum({
        data: dataWithEqualTotals,
        keys,
        orderBy: GraphOrderBy.VALUE_DESC,
      });

      expect(result).toEqual(dataWithEqualTotals);
    });
  });
});
