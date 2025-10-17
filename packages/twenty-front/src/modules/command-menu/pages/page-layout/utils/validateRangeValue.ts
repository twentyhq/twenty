import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { type CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { getConfigKeyFromSettingId } from '@/command-menu/pages/page-layout/utils/getConfigKeyFromSettingId';
import { isDefined } from 'twenty-shared/utils';

export const validateRangeValue = (
  settingId: CHART_CONFIGURATION_SETTING_IDS,
  newValue: number | null,
  configuration: ChartConfiguration,
): boolean => {
  const configKey = getConfigKeyFromSettingId(settingId);

  if (configKey === 'rangeMin') {
    if (
      'rangeMax' in configuration &&
      isDefined(configuration.rangeMax) &&
      isDefined(newValue) &&
      newValue > configuration.rangeMax
    ) {
      return true;
    }
  }

  if (configKey === 'rangeMax') {
    if (
      'rangeMin' in configuration &&
      isDefined(configuration.rangeMin) &&
      isDefined(newValue) &&
      newValue < configuration.rangeMin
    ) {
      return true;
    }
  }

  return false;
};
