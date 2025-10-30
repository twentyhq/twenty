import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { msg } from '@lingui/core/macro';
import { IconChartBar } from 'twenty-ui/display';
import { shouldHideChartSetting } from '../shouldHideChartSetting';

describe('shouldHideChartSetting', () => {
  const mockItemWithoutDependencies: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
    label: msg`Data Labels`,
    Icon: IconChartBar,
    isBoolean: true,
    isInput: false,
  };

  const mockItemDependingOnSource: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
    label: msg`X Axis Data`,
    Icon: IconChartBar,
    isBoolean: false,
    isInput: false,
    dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
  };

  const mockItemDependingOnGroupBy: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD,
    label: msg`Sort By Group`,
    Icon: IconChartBar,
    isBoolean: false,
    isInput: false,
    dependsOn: [CHART_CONFIGURATION_SETTING_IDS.GROUP_BY],
  };

  const mockItemWithMultipleDependencies: ChartSettingsItem = {
    id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
    label: msg`X Axis Data`,
    Icon: IconChartBar,
    isBoolean: false,
    isInput: false,
    dependsOn: [
      CHART_CONFIGURATION_SETTING_IDS.SOURCE,
      CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
    ],
  };

  describe('item without dependencies', () => {
    it('should return false when item has no dependencies', () => {
      const result = shouldHideChartSetting(
        mockItemWithoutDependencies,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });

    it('should return false when item has no dependencies even with no object metadata', () => {
      const result = shouldHideChartSetting(
        mockItemWithoutDependencies,
        '',
        false,
      );

      expect(result).toBe(false);
    });
  });

  describe('item depending on SOURCE', () => {
    it('should return true when no object metadata and item depends on SOURCE', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnSource,
        '',
        true,
      );

      expect(result).toBe(true);
    });

    it('should return false when object metadata exists and item depends on SOURCE', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnSource,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });
  });

  describe('item depending on GROUP_BY', () => {
    it('should return true when group by is not enabled and item depends on GROUP_BY', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnGroupBy,
        'valid-object-id',
        false,
      );

      expect(result).toBe(true);
    });

    it('should return false when group by is enabled and item depends on GROUP_BY', () => {
      const result = shouldHideChartSetting(
        mockItemDependingOnGroupBy,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });
  });

  describe('item with multiple dependencies', () => {
    it('should return true if any dependency is not met (no object metadata)', () => {
      const result = shouldHideChartSetting(
        mockItemWithMultipleDependencies,
        '',
        true,
      );

      expect(result).toBe(true);
    });

    it('should return true if any dependency is not met (group by disabled)', () => {
      const result = shouldHideChartSetting(
        mockItemWithMultipleDependencies,
        'valid-object-id',
        false,
      );

      expect(result).toBe(true);
    });

    it('should return false if all dependencies are met', () => {
      const result = shouldHideChartSetting(
        mockItemWithMultipleDependencies,
        'valid-object-id',
        true,
      );

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined dependsOn array', () => {
      const itemWithUndefinedDependsOn: ChartSettingsItem = {
        id: CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
        label: msg`Data Labels`,
        Icon: IconChartBar,
        isBoolean: true,
        isInput: false,
        dependsOn: undefined,
      };

      const result = shouldHideChartSetting(
        itemWithUndefinedDependsOn,
        '',
        false,
      );

      expect(result).toBe(false);
    });

    it('should handle empty dependsOn array', () => {
      const itemWithEmptyDependsOn: ChartSettingsItem = {
        id: CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
        label: msg`Data Labels`,
        Icon: IconChartBar,
        isBoolean: true,
        isInput: false,
        dependsOn: [],
      };

      const result = shouldHideChartSetting(itemWithEmptyDependsOn, '', false);

      expect(result).toBe(false);
    });
  });
});
