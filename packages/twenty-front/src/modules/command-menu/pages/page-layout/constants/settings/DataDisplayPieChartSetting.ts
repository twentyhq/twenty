import { ChartPieFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartPieFieldSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconChartPie } from 'twenty-ui/display';

export const DATA_DISPLAY_PIE_CHART_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconChartPie,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATA_ON_DISPLAY_PIE_CHART,
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_PIE_CHART,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
  DropdownContent: ChartPieFieldSelectionDropdownContent,
};
