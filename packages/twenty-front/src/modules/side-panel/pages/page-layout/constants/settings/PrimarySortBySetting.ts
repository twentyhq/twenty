import { ChartSortBySelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartSortBySelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconArrowSsort } from 'twenty-ui/display';

export const PRIMARY_SORT_BY_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconArrowSsort,
  label: CHART_CONFIGURATION_SETTING_LABELS.PRIMARY_SORT_BY,
  id: CHART_CONFIGURATION_SETTING_IDS.PRIMARY_SORT_BY,
  DropdownContent: ChartSortBySelectionDropdownContent,
};
