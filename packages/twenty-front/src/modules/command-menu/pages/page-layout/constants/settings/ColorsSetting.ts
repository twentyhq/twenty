import { ChartColorSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartColorSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { IconColorSwatch } from 'twenty-ui/display';

export const COLORS_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconColorSwatch,
  label: CHART_CONFIGURATION_SETTING_LABELS.COLORS,
  id: CHART_CONFIGURATION_SETTING_IDS.COLORS,
  DropdownContent: ChartColorSelectionDropdownContent,
  dropdownWidth: GenericDropdownContentWidth.ExtraLarge,
};
