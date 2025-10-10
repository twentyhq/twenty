import { ChartSortByGroupByFieldDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartSortByGroupByFieldDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconArrowsSort } from 'twenty-ui/display';

export const SORT_BY_GROUP_BY_FIELD_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconArrowsSort,
  label: CHART_CONFIGURATION_SETTING_LABELS.SORT_BY_GROUP_BY_FIELD,
  id: CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.GROUP_BY],
  DropdownContent: ChartSortByGroupByFieldDropdownContent,
};
