import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconChartBarPopular } from 'twenty-ui/display';

export const CUMULATIVE_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconChartBarPopular,
  label: CHART_CONFIGURATION_SETTING_LABELS.CUMULATIVE,
  id: CHART_CONFIGURATION_SETTING_IDS.CUMULATIVE,
};
