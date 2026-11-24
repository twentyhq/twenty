import { WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE } from '@/page-layout/constants/WidgetConfigurationTypenameByConfigurationType';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { convertBarOrLineChartConfigToPieChart } from '@/side-panel/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { convertPieChartConfigToBarOrLineChart } from '@/side-panel/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { getConfigurationTypeFromGraphType } from '@/side-panel/pages/page-layout/utils/getConfigurationTypeFromGraphType';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import {
  BarChartLayout,
  type WidgetConfiguration,
} from '~/generated-metadata/graphql';

export const getChartConfigurationUpdateForGraphType = ({
  currentConfiguration,
  graphType,
}: {
  currentConfiguration: WidgetConfiguration;
  graphType: GraphType;
}): Partial<ChartConfiguration> => {
  const newConfigurationType = getConfigurationTypeFromGraphType(graphType);

  let configToUpdate = {
    __typename:
      WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE[newConfigurationType],
    configurationType: newConfigurationType,
  } as Partial<ChartConfiguration>;

  const isPieChart = graphType === GraphType.PIE;
  const isVerticalBarChart = graphType === GraphType.VERTICAL_BAR;
  const isHorizontalBarChart = graphType === GraphType.HORIZONTAL_BAR;
  const isLineChart = graphType === GraphType.LINE;
  const isBarOrLineChart =
    isVerticalBarChart || isHorizontalBarChart || isLineChart;

  const wasBarOrLineChart =
    isWidgetConfigurationOfType(
      currentConfiguration,
      'BarChartConfiguration',
    ) ||
    isWidgetConfigurationOfType(currentConfiguration, 'LineChartConfiguration');

  const wasPieChart = isWidgetConfigurationOfType(
    currentConfiguration,
    'PieChartConfiguration',
  );

  if (isPieChart && wasBarOrLineChart) {
    configToUpdate = {
      ...configToUpdate,
      ...convertBarOrLineChartConfigToPieChart(currentConfiguration),
    };
  }

  if (isBarOrLineChart && wasPieChart) {
    configToUpdate = {
      ...configToUpdate,
      ...convertPieChartConfigToBarOrLineChart(currentConfiguration),
    };
  }

  if (isHorizontalBarChart) {
    configToUpdate = {
      ...configToUpdate,
      layout: BarChartLayout.HORIZONTAL,
    };
  }

  if (isVerticalBarChart) {
    configToUpdate = {
      ...configToUpdate,
      layout: BarChartLayout.VERTICAL,
    };
  }

  return configToUpdate;
};
