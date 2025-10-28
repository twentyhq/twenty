import { ChartGroupByFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconFilters } from 'twenty-ui/display';

export const GROUP_BY_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconFilters,
  label: CHART_CONFIGURATION_SETTING_LABELS.GROUP_BY,
  id: CHART_CONFIGURATION_SETTING_IDS.GROUP_BY,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
  DropdownContent: ChartGroupByFieldSelectionDropdownContent,
};
