import { getManualSortOrderFromConfig } from '@/command-menu/pages/page-layout/utils/getManualSortOrderFromConfig';
import { expect } from '@storybook/test';
import {
  WidgetConfigurationType,
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';

describe('getManualSortOrderFromConfig', () => {
  describe('pie chart configuration', () => {
    it('should return manualSortOrder for pie axis', () => {
      const config = {
        __typename: 'PieChartConfiguration' as const,
        manualSortOrder: ['a', 'b', 'c'],
      } as PieChartConfiguration;

      expect(getManualSortOrderFromConfig(config)).toEqual(['a', 'b', 'c']);
    });

    it('should return undefined for null manualSortOrder', () => {
      const config = {
        __typename: 'PieChartConfiguration' as const,
        manualSortOrder: null,
      } as PieChartConfiguration;

      expect(getManualSortOrderFromConfig(config)).toBeUndefined();
    });

    it('should return undefined when manualSortOrder is not in config', () => {
      const config = {
        __typename: 'PieChartConfiguration',
        configurationType: WidgetConfigurationType.PIE_CHART,
      } as PieChartConfiguration;

      expect(getManualSortOrderFromConfig(config)).toBeUndefined();
    });

    it('should return undefined for wrong typename', () => {
      const config = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        manualSortOrder: ['a', 'b', 'c'],
      } as unknown as BarChartConfiguration;

      expect(getManualSortOrderFromConfig(config)).toBeUndefined();
    });
  });

  describe('bar chart configuration', () => {
    it('should return primaryAxisManualSortOrder for primary axis', () => {
      const config = {
        __typename: 'BarChartConfiguration' as const,
        primaryAxisManualSortOrder: ['x', 'y', 'z'],
      } as BarChartConfiguration;

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
      } as BarChartConfiguration;

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
      } as BarChartConfiguration;

      expect(getManualSortOrderFromConfig(config, 'primary')).toBeUndefined();
    });
  });

  describe('line chart configuration', () => {
    it('should return primaryAxisManualSortOrder for primary axis', () => {
      const config = {
        __typename: 'LineChartConfiguration' as const,
        primaryAxisManualSortOrder: ['a', 'b'],
      } as LineChartConfiguration;

      expect(getManualSortOrderFromConfig(config, 'primary')).toEqual([
        'a',
        'b',
      ]);
    });

    it('should return secondaryAxisManualSortOrder for secondary axis', () => {
      const config = {
        __typename: 'LineChartConfiguration' as const,
        secondaryAxisManualSortOrder: ['c', 'd'],
      } as LineChartConfiguration;

      expect(getManualSortOrderFromConfig(config, 'secondary')).toEqual([
        'c',
        'd',
      ]);
    });
  });
});
