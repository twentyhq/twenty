import { ChartXAxisFieldSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartXAxisFieldSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconAxisX } from 'twenty-ui/display';

export const DATA_DISPLAY_X_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconAxisX,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATA_ON_DISPLAY_X,
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
  DropdownContent: ChartXAxisFieldSelectionDropdownContent,
};
