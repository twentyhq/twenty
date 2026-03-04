import { ChartFieldSelectionForAggregateOperationDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartFieldSelectionForAggregateOperationDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconSum } from 'twenty-ui/display';

export const DATA_DISPLAY_AGGREGATE_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconSum,
  label: CHART_CONFIGURATION_SETTING_LABELS.DATA_ON_DISPLAY_AGGREGATE,
  id: CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_AGGREGATE,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
  DropdownContent: ChartFieldSelectionForAggregateOperationDropdownContent,
};
