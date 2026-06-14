import { ChartNumberFormatSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartNumberFormatSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { Icon123 } from 'twenty-ui-deprecated/display';

export const FORMAT_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: Icon123,
  label: CHART_CONFIGURATION_SETTING_LABELS.FORMAT,
  id: CHART_CONFIGURATION_SETTING_IDS.FORMAT,
  DropdownContent: ChartNumberFormatSelectionDropdownContent,
};
