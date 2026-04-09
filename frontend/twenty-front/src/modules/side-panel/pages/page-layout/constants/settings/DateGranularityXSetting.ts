import { ChartDateGranularityXSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartDateGranularityXSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconCalendar } from 'twenty-ui/display';

export const DATE_GRANULARITY_X_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconCalendar,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATE_GRANULARITY_X,
  id: CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY_X,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X],
  DropdownContent: ChartDateGranularityXSelectionDropdownContent,
};
