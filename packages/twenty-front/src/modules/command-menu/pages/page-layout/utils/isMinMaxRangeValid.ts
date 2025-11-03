import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { isDefined } from 'twenty-shared/utils';

export const isMinMaxRangeValid = (
  settingId:
    | CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE
    | CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
  newValue: number,
  configuration: ChartConfiguration,
): boolean => {
  if (settingId === CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE) {
    if (
      'rangeMax' in configuration &&
      isDefined(configuration.rangeMax) &&
      newValue > configuration.rangeMax
    ) {
      return false;
    }
  }

  if (settingId === CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE) {
    if (
      'rangeMin' in configuration &&
      isDefined(configuration.rangeMin) &&
      newValue < configuration.rangeMin
    ) {
      return false;
    }
  }

  return true;
};
