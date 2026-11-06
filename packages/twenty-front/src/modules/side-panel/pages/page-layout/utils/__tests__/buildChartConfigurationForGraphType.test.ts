import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { buildChartConfigurationForGraphType } from '@/side-panel/pages/page-layout/utils/buildChartConfigurationForGraphType';
import {
  BarChartLayout,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('buildChartConfigurationForGraphType', () => {
  it('drops bar chart settings a pie chart does not support', () => {
    const result = buildChartConfigurationForGraphType({
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        color: 'blue',
        rangeMin: 10,
      },
      graphType: GraphType.PIE,
      objectMetadataItem: undefined,
    });

    expect(result).toEqual({
      __typename: 'PieChartConfiguration',
      configurationType: WidgetConfigurationType.PIE_CHART,
      aggregateFieldMetadataId:
        TEST_BAR_CHART_CONFIGURATION.aggregateFieldMetadataId,
      aggregateOperation: TEST_BAR_CHART_CONFIGURATION.aggregateOperation,
      displayDataLabel: TEST_BAR_CHART_CONFIGURATION.displayDataLabel,
      splitMultiValueFields: TEST_BAR_CHART_CONFIGURATION.splitMultiValueFields,
      color: 'blue',
      groupByFieldMetadataId:
        TEST_BAR_CHART_CONFIGURATION.primaryAxisGroupByFieldMetadataId,
      groupBySubFieldName:
        TEST_BAR_CHART_CONFIGURATION.primaryAxisGroupBySubFieldName,
      dateGranularity: TEST_BAR_CHART_CONFIGURATION.primaryAxisDateGranularity,
      orderBy: TEST_BAR_CHART_CONFIGURATION.primaryAxisOrderBy,
    });
  });

  it('drops pie chart settings an aggregate chart does not support', () => {
    const result = buildChartConfigurationForGraphType({
      configuration: { ...TEST_PIE_CHART_CONFIGURATION, color: 'red' },
      graphType: GraphType.AGGREGATE,
      objectMetadataItem: undefined,
    });

    expect(result).toEqual({
      __typename: 'AggregateChartConfiguration',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId:
        TEST_PIE_CHART_CONFIGURATION.aggregateFieldMetadataId,
      aggregateOperation: TEST_PIE_CHART_CONFIGURATION.aggregateOperation,
      displayDataLabel: TEST_PIE_CHART_CONFIGURATION.displayDataLabel,
    });
  });

  it('drops aggregate chart settings a bar chart does not support and sets the layout', () => {
    const result = buildChartConfigurationForGraphType({
      configuration: {
        ...TEST_AGGREGATE_CHART_CONFIGURATION,
        label: 'Revenue',
        description: 'Total revenue',
      },
      graphType: GraphType.HORIZONTAL_BAR,
      objectMetadataItem: undefined,
    });

    expect(result).toEqual({
      __typename: 'BarChartConfiguration',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateFieldMetadataId:
        TEST_AGGREGATE_CHART_CONFIGURATION.aggregateFieldMetadataId,
      aggregateOperation: TEST_AGGREGATE_CHART_CONFIGURATION.aggregateOperation,
      displayDataLabel: TEST_AGGREGATE_CHART_CONFIGURATION.displayDataLabel,
      description: 'Total revenue',
      layout: BarChartLayout.HORIZONTAL,
    });
  });
});
