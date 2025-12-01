import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { msg } from '@lingui/core/macro';
import { IconCaretLeft } from 'twenty-ui/display';

export const PREFIX_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconCaretLeft,
  label: CHART_CONFIGURATION_SETTING_LABELS.PREFIX,
  id: CHART_CONFIGURATION_SETTING_IDS.PREFIX,
  isTextInput: true,
  inputPlaceholder: msg`unit`,
};
