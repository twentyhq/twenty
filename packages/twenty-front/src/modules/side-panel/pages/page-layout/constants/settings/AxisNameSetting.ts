import { ChartAxisNameSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartAxisNameSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconGizmo } from 'twenty-ui/display';

export const AXIS_NAME_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconGizmo,
  label: CHART_CONFIGURATION_SETTING_LABELS.AXIS_NAME,
  id: CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME,
  DropdownContent: ChartAxisNameSelectionDropdownContent,
};
