import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingLabels';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconFilter } from 'twenty-ui/display';

export const FILTER_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconFilter,
  label: CHART_CONFIGURATION_SETTING_LABELS.FILTER,
  id: CHART_CONFIGURATION_SETTING_IDS.FILTER,
};
