import { ChartFieldSelectionForAggregateOperationDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartFieldSelectionForAggregateOperationDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconChartPie } from 'twenty-ui/display';

export const EACH_SLICE_REPRESENTS_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconChartPie,
  label: CHART_CONFIGURATION_SETTING_LABELS.EACH_SLICE_REPRESENTS,
  id: CHART_CONFIGURATION_SETTING_IDS.EACH_SLICE_REPRESENTS,
  DropdownContent: ChartFieldSelectionForAggregateOperationDropdownContent,
};
