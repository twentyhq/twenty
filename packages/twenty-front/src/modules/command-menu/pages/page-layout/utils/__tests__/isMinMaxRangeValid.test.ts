import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { isMinMaxRangeValid } from '@/command-menu/pages/page-layout/utils/isMinMaxRangeValid';
import { BarChartLayout, WidgetConfigurationType } from '~/generated/graphql';

describe('isMinMaxRangeValid', () => {
  const mockConfiguration = {
    __typename: 'BarChartConfiguration',
    configurationType: WidgetConfigurationType.BAR_CHART,
    layout: BarChartLayout.VERTICAL,
    rangeMin: 10,
    rangeMax: 100,
  } as ChartConfiguration;

  describe('MIN_RANGE validation', () => {
    it('should be valid when new rangeMin is less than existing rangeMax', () => {
      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        50,
        mockConfiguration,
      );

      expect(result).toBe(true);
    });

    it('should be valid when new rangeMin equals existing rangeMax', () => {
      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        100,
        mockConfiguration,
      );

      expect(result).toBe(true);
    });

    it('should be invalid when new rangeMin is greater than existing rangeMax', () => {
      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        150,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });
  });

  describe('MAX_RANGE validation', () => {
    it('should be valid when new rangeMax is greater than existing rangeMin', () => {
      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        50,
        mockConfiguration,
      );

      expect(result).toBe(true);
    });

    it('should be valid when new rangeMax equals existing rangeMin', () => {
      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        10,
        mockConfiguration,
      );

      expect(result).toBe(true);
    });

    it('should be invalid when new rangeMax is less than existing rangeMin', () => {
      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        5,
        mockConfiguration,
      );

      expect(result).toBe(false);
    });
  });
  describe('edge cases', () => {
    it('should be valid when new rangeMin is negative and greater than existing rangeMax', () => {
      const configWithNegatives = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        rangeMin: -100,
        rangeMax: -10,
      } as ChartConfiguration;

      const validMin = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        -50,
        configWithNegatives,
      );
      expect(validMin).toBe(true);

      const invalidMin = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        -5,
        configWithNegatives,
      );
      expect(invalidMin).toBe(false);
    });

    it('should be valid when new rangeMin is zero and greater than existing rangeMax', () => {
      const configWithZero = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        rangeMin: 0,
        rangeMax: 100,
      } as ChartConfiguration;

      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        0,
        configWithZero,
      );
      expect(result).toBe(true);
    });
  });

  describe('setting first value (empty configuration)', () => {
    it('should be valid when setting rangeMin on configuration without any range values', () => {
      const emptyConfig = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
      } as ChartConfiguration;

      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        50,
        emptyConfig,
      );

      expect(result).toBe(true);
    });

    it('should be valid when setting rangeMax on configuration without any range values', () => {
      const emptyConfig = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
      } as ChartConfiguration;

      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        100,
        emptyConfig,
      );

      expect(result).toBe(true);
    });

    it('should be valid when setting rangeMin without existing rangeMax', () => {
      const configWithOnlyMin = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        rangeMin: 10,
      } as ChartConfiguration;

      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        20,
        configWithOnlyMin,
      );

      expect(result).toBe(true);
    });

    it('should be valid when setting rangeMax without existing rangeMin', () => {
      const configWithOnlyMax = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        rangeMax: 100,
      } as ChartConfiguration;

      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        150,
        configWithOnlyMax,
      );

      expect(result).toBe(true);
    });

    it('should be invalid when setting rangeMin that would exceed existing rangeMax', () => {
      const configWithOnlyMax = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        rangeMax: 100,
      } as ChartConfiguration;

      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE,
        150,
        configWithOnlyMax,
      );

      expect(result).toBe(false);
    });

    it('should be invalid when setting rangeMax that would be less than existing rangeMin', () => {
      const configWithOnlyMin = {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        rangeMin: 50,
      } as ChartConfiguration;

      const result = isMinMaxRangeValid(
        CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
        10,
        configWithOnlyMin,
      );

      expect(result).toBe(false);
    });
  });
});
