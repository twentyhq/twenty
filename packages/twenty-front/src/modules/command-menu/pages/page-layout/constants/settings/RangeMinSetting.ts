import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconMathMin } from 'twenty-ui/display';

export const RANGE_MIN_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconMathMin,
  label: CHART_CONFIGURATION_SETTING_LABELS.RANGE_MIN,
  id: CHART_CONFIGURATION_SETTING_IDS.RANGE_MIN,
  isInput: true,
};
