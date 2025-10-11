import { ChartGraphLayoutSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGraphLayoutSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconLayout } from 'twenty-ui/display';

export const GRAPH_LAYOUT_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconLayout,
  label: CHART_CONFIGURATION_SETTING_LABELS.GRAPH_LAYOUT,
  id: CHART_CONFIGURATION_SETTING_IDS.GRAPH_LAYOUT,
  DropdownContent: ChartGraphLayoutSelectionDropdownContent,
};
