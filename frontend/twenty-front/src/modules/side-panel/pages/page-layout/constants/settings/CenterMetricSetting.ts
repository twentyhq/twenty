import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconNumber123 } from 'twenty-ui/display';

export const CENTER_METRIC_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconNumber123,
  label: CHART_CONFIGURATION_SETTING_LABELS.CENTER_METRIC,
  id: CHART_CONFIGURATION_SETTING_IDS.CENTER_METRIC,
};
