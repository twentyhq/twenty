import {
  type CHART_CONFIGURATION_SETTING_IDS,
  CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP,
} from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';

export const getConfigKeyFromSettingId = (
  settingId: CHART_CONFIGURATION_SETTING_IDS,
): string => {
  return settingId in CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP
    ? CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP[
        settingId as keyof typeof CHART_CONFIGURATION_SETTING_TO_CONFIG_KEY_MAP
      ]
    : settingId;
};
