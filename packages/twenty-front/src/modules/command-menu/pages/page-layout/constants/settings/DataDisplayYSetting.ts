import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingLabels';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconAxisY } from 'twenty-ui/display';

export const DATA_DISPLAY_Y_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconAxisY,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATA_ON_DISPLAY_Y,
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
};
