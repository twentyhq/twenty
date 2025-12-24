import { getManualSortOrderFromConfig } from '@/command-menu/pages/page-layout/utils/getManualSortOrderFromConfig';

describe('getManualSortOrderFromConfig', () => {
  describe('pie chart configuration', () => {
    it('should return manualSortOrder for pie axis', () => {
      const config = {
        __typename: 'PieChartConfiguration' as const,
        manualSortOrder: ['a', 'b', 'c'],
      };

      expect(getManualSortOrderFromConfig(config, 'pie')).toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('should return undefined for null manualSortOrder', () => {
      const config = {
        __typename: 'PieChartConfiguration' as const,
        manualSortOrder: null,
      };

      expect(getManualSortOrderFromConfig(config, 'pie')).toBeUndefined();
    });

    it('should return undefined when manualSortOrder is not in config', () => {
      const config = {
        __typename: 'PieChartConfiguration' as const,
      };

      expect(getManualSortOrderFromConfig(config, 'pie')).toBeUndefined();
    });

    it('should return undefined for wrong typename', () => {
      const config = {
        __typename: 'BarChartConfiguration' as const,
        manualSortOrder: ['a', 'b', 'c'],
      };

      expect(getManualSortOrderFromConfig(config, 'pie')).toBeUndefined();
    });
  });

  describe('bar chart configuration', () => {
    it('should return primaryAxisManualSortOrder for primary axis', () => {
      const config = {
        __typename: 'BarChartConfiguration' as const,
        primaryAxisManualSortOrder: ['x', 'y', 'z'],
      };

      expect(getManualSortOrderFromConfig(config, 'primary')).toEqual([
        'x',
        'y',
        'z',
      ]);
    });

    it('should return secondaryAxisManualSortOrder for secondary axis', () => {
      const config = {
        __typename: 'BarChartConfiguration' as const,
        secondaryAxisManualSortOrder: ['1', '2', '3'],
      };

      expect(getManualSortOrderFromConfig(config, 'secondary')).toEqual([
        '1',
        '2',
        '3',
      ]);
    });

    it('should return undefined for null primaryAxisManualSortOrder', () => {
      const config = {
        __typename: 'BarChartConfiguration' as const,
        primaryAxisManualSortOrder: null,
      };

      expect(getManualSortOrderFromConfig(config, 'primary')).toBeUndefined();
    });
  });

  describe('line chart configuration', () => {
    it('should return primaryAxisManualSortOrder for primary axis', () => {
      const config = {
        __typename: 'LineChartConfiguration' as const,
        primaryAxisManualSortOrder: ['a', 'b'],
      };

      expect(getManualSortOrderFromConfig(config, 'primary')).toEqual([
        'a',
        'b',
      ]);
    });

    it('should return secondaryAxisManualSortOrder for secondary axis', () => {
      const config = {
        __typename: 'LineChartConfiguration' as const,
        secondaryAxisManualSortOrder: ['c', 'd'],
      };

      expect(getManualSortOrderFromConfig(config, 'secondary')).toEqual([
        'c',
        'd',
      ]);
    });
  });
});
