import { ChartDateGranularityYSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartDateGranularityYSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconCalendar } from 'twenty-ui/display';

export const DATE_GRANULARITY_Y_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconCalendar,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATE_GRANULARITY_Y,
  id: CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_Y,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.GROUP_BY],
  DropdownContent: ChartDateGranularityYSelectionDropdownContent,
};
