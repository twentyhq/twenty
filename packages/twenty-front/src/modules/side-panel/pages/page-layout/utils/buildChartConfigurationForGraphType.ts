import { WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE } from '@/page-layout/constants/WidgetConfigurationTypenameByConfigurationType';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { type TypedBarChartConfiguration } from '@/side-panel/pages/page-layout/types/TypedBarChartConfiguration';
import { convertAggregateOperationForDateField } from '@/side-panel/pages/page-layout/utils/convertAggregateOperationForDateField';
import { convertBarOrLineChartConfigToPieChart } from '@/side-panel/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { convertPieChartConfigToBarOrLineChart } from '@/side-panel/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { getConfigurationTypeFromGraphType } from '@/side-panel/pages/page-layout/utils/getConfigurationTypeFromGraphType';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { CHART_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE } from 'twenty-shared/constants';
import { type GraphWidgetConfigurationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated-metadata/graphql';

export const buildChartConfigurationForGraphType = ({
  configuration,
  graphType,
  objectMetadataItem,
}: {
  configuration: ChartConfiguration;
  graphType: GraphType;
  objectMetadataItem: EnrichedObjectMetadataItem | undefined;
}): ChartConfiguration => {
  const newConfigurationType = getConfigurationTypeFromGraphType(graphType);

  const allowedKeys =
    CHART_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE[
      newConfigurationType as GraphWidgetConfigurationType
    ];

  let newConfiguration = {
    ...Object.fromEntries(
      Object.entries(configuration).filter(([key]) => key in allowedKeys),
    ),
    __typename:
      WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE[newConfigurationType],
    configurationType: newConfigurationType,
  } as ChartConfiguration;

  if (graphType !== GraphType.AGGREGATE) {
    const convertedAggregateOperation = convertAggregateOperationForDateField(
      configuration,
      objectMetadataItem,
    );

    if (isDefined(convertedAggregateOperation)) {
      newConfiguration = {
        ...newConfiguration,
        aggregateOperation: convertedAggregateOperation,
      };
    }
  }

  const isPieChart = graphType === GraphType.PIE;
  const isBarOrLineChart =
    graphType === GraphType.VERTICAL_BAR ||
    graphType === GraphType.HORIZONTAL_BAR ||
    graphType === GraphType.LINE;

  const wasBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (isPieChart && wasBarOrLineChart) {
    newConfiguration = {
      ...newConfiguration,
      ...convertBarOrLineChartConfigToPieChart(configuration),
    };
  }

  if (
    isBarOrLineChart &&
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')
  ) {
    newConfiguration = {
      ...newConfiguration,
      ...convertPieChartConfigToBarOrLineChart(configuration),
    };
  }

  if (graphType === GraphType.HORIZONTAL_BAR) {
    newConfiguration = {
      ...(newConfiguration as TypedBarChartConfiguration),
      layout: BarChartLayout.HORIZONTAL,
    };
  }

  if (graphType === GraphType.VERTICAL_BAR) {
    newConfiguration = {
      ...(newConfiguration as TypedBarChartConfiguration),
      layout: BarChartLayout.VERTICAL,
    };
  }

  return newConfiguration;
};
