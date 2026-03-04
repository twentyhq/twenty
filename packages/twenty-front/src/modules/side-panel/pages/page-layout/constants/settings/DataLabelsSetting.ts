import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconBadge2k } from 'twenty-ui/display';

export const DATA_LABELS_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconBadge2k,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATA_LABELS,
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_LABELS,
};
