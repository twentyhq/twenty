import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconArrowsSplit2 } from 'twenty-ui/display';

export const SPLIT_MULTI_VALUE_FIELDS_X_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconArrowsSplit2,
  label: CHART_CONFIGURATION_SETTING_LABELS.SPLIT_MULTI_VALUE_FIELDS_X,
  id: CHART_CONFIGURATION_SETTING_IDS.SPLIT_MULTI_VALUE_FIELDS_X,
};
