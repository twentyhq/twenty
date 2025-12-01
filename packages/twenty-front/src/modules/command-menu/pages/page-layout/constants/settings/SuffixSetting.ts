import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { msg } from '@lingui/core/macro';
import { IconCaretRight } from 'twenty-ui/display';

export const SUFFIX_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconCaretRight,
  label: CHART_CONFIGURATION_SETTING_LABELS.SUFFIX,
  id: CHART_CONFIGURATION_SETTING_IDS.SUFFIX,
  isTextInput: true,
  inputPlaceholder: msg`unit`,
};
