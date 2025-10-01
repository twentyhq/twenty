import { ChartAxisNameSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartAxisNameSelectionDropdownContent';
import { ChartColorSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartColorSelectionDropdownContent';
import { ChartDataSourceDropdownContent } from '@/command-menu/pages/page-layout/components/ChartDataSourceDropdownContent';
import { ChartXAxisFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartXAxisFieldSelectionDropdownContent';
import { ChartXAxisSortBySelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartXAxisSortBySelectionDropdownContent';
import { ChartYAxisFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartYAxisFieldSelectionDropdownContent';
import { ChartYAxisGroupByFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/ChartYAxisGroupByFieldSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';

export const getChartSettingsDropdownContent = (itemId: string) => {
  switch (itemId) {
    case CHART_CONFIGURATION_SETTING_IDS.SOURCE:
      return <ChartDataSourceDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X:
      return <ChartXAxisFieldSelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_X:
      return <ChartXAxisSortBySelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y:
      return <ChartYAxisFieldSelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.GROUP_BY_Y:
      return <ChartYAxisGroupByFieldSelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.COLORS:
      return <ChartColorSelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME:
      return <ChartAxisNameSelectionDropdownContent />;
    default:
      return <div>Configuration options will be implemented here</div>;
  }
};
