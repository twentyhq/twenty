import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconTextCaption } from 'twenty-ui/display';

export const SHOW_LEGEND_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconTextCaption,
  label: CHART_CONFIGURATION_SETTING_LABELS.SHOW_LEGEND,
  id: CHART_CONFIGURATION_SETTING_IDS.SHOW_LEGEND,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.GROUP_BY],
};
