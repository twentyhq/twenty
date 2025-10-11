import { ChartDataSourceDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartDataSourceDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconDatabase } from 'twenty-ui/display';

export const CHART_DATA_SOURCE_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconDatabase,
  label: CHART_CONFIGURATION_SETTING_LABELS.SOURCE,
  id: CHART_CONFIGURATION_SETTING_IDS.SOURCE,
  DropdownContent: ChartDataSourceDropdownContent,
};
