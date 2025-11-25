import { ChartSortBySelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartSortBySelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconArrowsSort } from 'twenty-ui/display';

export const PRIMARY_SORT_BY_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconArrowsSort,
  label: CHART_CONFIGURATION_SETTING_LABELS.PRIMARY_SORT_BY,
  id: CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY,
  DropdownContent: ChartSortBySelectionDropdownContent,
};
