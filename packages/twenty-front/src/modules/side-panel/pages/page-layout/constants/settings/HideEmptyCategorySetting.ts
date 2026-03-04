import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconEyeOff } from 'twenty-ui/display';

export const HIDE_EMPTY_CATEGORY_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconEyeOff,
  label: CHART_CONFIGURATION_SETTING_LABELS.HIDE_EMPTY_CATEGORY,
  id: CHART_CONFIGURATION_SETTING_IDS.HIDE_EMPTY_CATEGORY,
};
