import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingLabels';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconAxisX } from 'twenty-ui/display';

export const DATA_DISPLAY_X_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconAxisX,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATA_ON_DISPLAY_X,
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
};
