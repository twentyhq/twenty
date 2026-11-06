import { WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE } from '@/page-layout/constants/WidgetConfigurationTypenameByConfigurationType';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getChartDefaultFieldSelection } from '@/page-layout/utils/getChartDefaultFieldSelection';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { buildChartGroupByFieldConfigUpdate } from '@/side-panel/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';
import { convertAggregateOperationForDateField } from '@/side-panel/pages/page-layout/utils/convertAggregateOperationForDateField';
import { convertBarOrLineChartConfigToPieChart } from '@/side-panel/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { convertPieChartConfigToBarOrLineChart } from '@/side-panel/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { getConfigurationTypeFromGraphType } from '@/side-panel/pages/page-layout/utils/getConfigurationTypeFromGraphType';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { CHART_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated-metadata/graphql';

const BAR_CHART_LAYOUT_BY_GRAPH_TYPE: Partial<
  Record<GraphType, BarChartLayout>
> = {
  [GraphType.VERTICAL_BAR]: BarChartLayout.VERTICAL,
  [GraphType.HORIZONTAL_BAR]: BarChartLayout.HORIZONTAL,
};

const fillMissingGroupByWithDefaultField = ({
  configuration,
  objectMetadataItem,
}: {
  configuration: ChartConfiguration;
  objectMetadataItem: EnrichedObjectMetadataItem | undefined;
}): ChartConfiguration => {
  if (!isDefined(objectMetadataItem)) {
    return configuration;
  }

  const { groupByFieldMetadataId } =
    getChartDefaultFieldSelection(objectMetadataItem);

  if (
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration') &&
    !isDefined(configuration.groupByFieldMetadataId)
  ) {
    return {
      ...configuration,
      ...buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey: 'groupByFieldMetadataId',
        subFieldNameKey: 'groupBySubFieldName',
        fieldId: groupByFieldMetadataId ?? null,
        subFieldName: null,
        objectMetadataItem,
      }),
    };
  }

  if (
    (isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
      isWidgetConfigurationOfType(configuration, 'LineChartConfiguration')) &&
    !isDefined(configuration.primaryAxisGroupByFieldMetadataId)
  ) {
    return {
      ...configuration,
      ...buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey: 'primaryAxisGroupByFieldMetadataId',
        subFieldNameKey: 'primaryAxisGroupBySubFieldName',
        fieldId: groupByFieldMetadataId ?? null,
        subFieldName: null,
        objectMetadataItem,
      }),
    };
  }

  return configuration;
};

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
    CHART_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE[newConfigurationType];

  let newConfiguration = {
    ...Object.fromEntries(
      Object.entries(configuration).filter(([key]) => key in allowedKeys),
    ),
    __typename:
      WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE[newConfigurationType],
    configurationType: newConfigurationType,
  } as ChartConfiguration;

  const convertedAggregateOperation = convertAggregateOperationForDateField(
    configuration,
    objectMetadataItem,
  );

  if (
    graphType !== GraphType.AGGREGATE &&
    isDefined(convertedAggregateOperation)
  ) {
    newConfiguration = {
      ...newConfiguration,
      aggregateOperation: convertedAggregateOperation,
    };
  }

  const isSwitchingFromBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (graphType === GraphType.PIE && isSwitchingFromBarOrLineChart) {
    newConfiguration = {
      ...newConfiguration,
      ...convertBarOrLineChartConfigToPieChart(configuration),
    };
  }

  const isBarOrLineChart =
    graphType === GraphType.VERTICAL_BAR ||
    graphType === GraphType.HORIZONTAL_BAR ||
    graphType === GraphType.LINE;

  if (
    isBarOrLineChart &&
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')
  ) {
    newConfiguration = {
      ...newConfiguration,
      ...convertPieChartConfigToBarOrLineChart(configuration),
    };
  }

  const barChartLayout = BAR_CHART_LAYOUT_BY_GRAPH_TYPE[graphType];

  if (
    isDefined(barChartLayout) &&
    isWidgetConfigurationOfType(newConfiguration, 'BarChartConfiguration')
  ) {
    newConfiguration = { ...newConfiguration, layout: barChartLayout };
  }

  return fillMissingGroupByWithDefaultField({
    configuration: newConfiguration,
    objectMetadataItem,
  });
};
