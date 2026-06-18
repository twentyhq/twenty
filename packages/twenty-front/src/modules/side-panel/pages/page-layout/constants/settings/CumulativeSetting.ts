import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconChartBarPopular } from 'twenty-ui/display';

export const CUMULATIVE_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconChartBarPopular,
  label: CHART_CONFIGURATION_SETTING_LABELS.CUMULATIVE,
  id: CHART_CONFIGURATION_SETTING_IDS.CUMULATIVE,
};
