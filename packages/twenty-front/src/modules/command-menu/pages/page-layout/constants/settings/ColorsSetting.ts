import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingLabels';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconColorSwatch } from 'twenty-ui/display';

export const COLORS_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconColorSwatch,
  label: CHART_CONFIGURATION_SETTING_LABELS.COLORS,
  id: CHART_CONFIGURATION_SETTING_IDS.COLORS,
};
