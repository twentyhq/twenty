import { ChartWaffleFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartWaffleFieldSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconGridDots } from 'twenty-ui/display';

export const DATA_DISPLAY_WAFFLE_CHART_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconGridDots,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATA_ON_DISPLAY_WAFFLE_CHART,
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_WAFFLE_CHART,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
  DropdownContent: ChartWaffleFieldSelectionDropdownContent,
};
