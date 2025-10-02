import { ChartAxisNameSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartAxisNameSelectionDropdownContent';
import { ChartColorSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartColorSelectionDropdownContent';
import { ChartDataSourceDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartDataSourceDropdownContent';
import { ChartFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartFieldSelectionDropdownContent';
import { ChartFieldSelectionForAggregateOperationDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartFieldSelectionForAggregateOperationDropdownContent';
import { ChartGroupByFieldSelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionDropdownContent';
import { ChartSortByGroupByFieldDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartSortByGroupByFieldDropdownContent';
import { ChartXAxisSortBySelectionDropdownContent } from '@/command-menu/pages/page-layout/components/dropdown-content/ChartXAxisSortBySelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { t } from '@lingui/core/macro';

export const getChartSettingsDropdownContent = (itemId: string) => {
  switch (itemId) {
    case CHART_CONFIGURATION_SETTING_IDS.SOURCE:
      return <ChartDataSourceDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_X:
      return <ChartFieldSelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_X:
      return <ChartXAxisSortBySelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.DATA_ON_DISPLAY_Y:
      return <ChartFieldSelectionForAggregateOperationDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.SORT_BY_GROUP_BY_FIELD:
      return (
        <ChartSortByGroupByFieldDropdownContent title={t`Y-Axis Sort By`} />
      );
    case CHART_CONFIGURATION_SETTING_IDS.GROUP_BY:
      return <ChartGroupByFieldSelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.COLORS:
      return <ChartColorSelectionDropdownContent />;
    case CHART_CONFIGURATION_SETTING_IDS.AXIS_NAME:
      return <ChartAxisNameSelectionDropdownContent />;
    default:
      return <div>Configuration options will be implemented here</div>;
  }
};
