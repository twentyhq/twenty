import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { isBarOrLineChartConfiguration } from '@/command-menu/pages/page-layout/utils/isBarOrLineChartConfiguration';
import { isDefined } from 'twenty-shared/utils';

export const isMinMaxRangeValid = (
  settingId:
    | CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE
    | CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE,
  newValue: number,
  configuration: ChartConfiguration,
): boolean => {
  if (!isBarOrLineChartConfiguration(configuration)) {
    return true;
  }

  if (settingId === CHART_CONFIGURATION_SETTING_IDS.MIN_RANGE) {
    if (
      isDefined(configuration.rangeMax) &&
      newValue > configuration.rangeMax
    ) {
      return false;
    }
  }

  if (settingId === CHART_CONFIGURATION_SETTING_IDS.MAX_RANGE) {
    if (
      isDefined(configuration.rangeMin) &&
      newValue < configuration.rangeMin
    ) {
      return false;
    }
  }

  return true;
};
