import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconMathMax } from 'twenty-ui/display';

export const RANGE_MAX_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconMathMax,
  label: CHART_CONFIGURATION_SETTING_LABELS.RANGE_MAX,
  id: CHART_CONFIGURATION_SETTING_IDS.RANGE_MAX,
  isInput: true,
};
