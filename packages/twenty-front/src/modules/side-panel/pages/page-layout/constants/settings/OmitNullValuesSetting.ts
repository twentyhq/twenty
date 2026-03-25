import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconEyeOff } from 'twenty-ui/display';

export const OMIT_NULL_VALUES_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconEyeOff,
  label: CHART_CONFIGURATION_SETTING_LABELS.OMIT_NULL_VALUES,
  id: CHART_CONFIGURATION_SETTING_IDS.OMIT_NULL_VALUES,
};
