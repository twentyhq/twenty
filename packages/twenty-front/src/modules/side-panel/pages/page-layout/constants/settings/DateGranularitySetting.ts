import { ChartDateGranularitySelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartDateGranularitySelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconCalendar } from 'twenty-ui/display';

export const DATE_GRANULARITY_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconCalendar,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATE_GRANULARITY,
  id: CHART_CONFIGURATION_SETTING_IDS.DATE_GRANULARITY,
  DropdownContent: ChartDateGranularitySelectionDropdownContent,
};
