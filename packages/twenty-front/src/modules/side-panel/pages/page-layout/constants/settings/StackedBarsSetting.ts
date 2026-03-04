import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconStack2 } from 'twenty-ui/display';

export const STACKED_BARS_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconStack2,
  label: CHART_CONFIGURATION_SETTING_LABELS.STACKED_BARS,
  id: CHART_CONFIGURATION_SETTING_IDS.STACKED_BARS,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.GROUP_BY],
};
