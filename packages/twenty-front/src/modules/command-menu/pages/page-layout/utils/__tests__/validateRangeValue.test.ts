import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { GraphType } from '~/generated/graphql';
import { validateRangeValue } from '../validateRangeValue';

describe('validateRangeValue', () => {
  const mockConfiguration = {
    __typename: 'BarChartConfiguration',
    graphType: GraphType.VERTICAL_BAR,
    rangeMin: 10,
    rangeMax: 100,
  } as ChartConfiguration;

  describe('MIN_RANGE validation', () => {
    it('should return false (valid) when new rangeMin is less than existing rangeMax', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        50,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });

    it('should return false (valid) when new rangeMin equals existing rangeMax', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        100,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });

    it('should return true (invalid) when new rangeMin is greater than existing rangeMax', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        150,
        mockConfiguration,
      );

      expect(result).toBe(true);
    });

    it('should return false (valid) when new rangeMin is null', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        null,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });

    it('should return false (valid) when rangeMax is not defined', () => {
      const configWithoutMax = {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.VERTICAL_BAR,
      } as ChartConfiguration;

      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        50,
        configWithoutMax,
      );

      expect(result).toBe(false);
    });
  });

  describe('MAX_RANGE validation', () => {
    it('should return false (valid) when new rangeMax is greater than existing rangeMin', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        50,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });

    it('should return false (valid) when new rangeMax equals existing rangeMin', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        10,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });

    it('should return true (invalid) when new rangeMax is less than existing rangeMin', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        5,
        mockConfiguration,
      );

      expect(result).toBe(true);
    });

    it('should return false (valid) when new rangeMax is null', () => {
      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        null,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });

    it('should return false (valid) when rangeMin is not defined', () => {
      const configWithoutMin = {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.VERTICAL_BAR,
      } as ChartConfiguration;

      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        50,
        configWithoutMin,
      );

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers correctly', () => {
      const configWithNegatives = {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.VERTICAL_BAR,
        rangeMin: -100,
        rangeMax: -10,
      } as ChartConfiguration;

      const validMin = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        -50,
        configWithNegatives,
      );
      expect(validMin).toBe(false);

      const invalidMin = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        -5,
        configWithNegatives,
      );
      expect(invalidMin).toBe(true);
    });

    it('should handle zero values correctly', () => {
      const configWithZero = {
        __typename: 'BarChartConfiguration',
        graphType: GraphType.VERTICAL_BAR,
        rangeMin: 0,
        rangeMax: 100,
      } as ChartConfiguration;

      const result = validateRangeValue(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        0,
        configWithZero,
      );
      expect(result).toBe(false);
    });
  });
});
