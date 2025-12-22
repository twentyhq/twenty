import { type TypedAggregateChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedAggregateChartConfiguration';
import { type TypedBarChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedBarChartConfiguration';
import { type TypedGaugeChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedGaugeChartConfiguration';
import { type TypedLineChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedLineChartConfiguration';
import { type TypedPieChartConfiguration } from '@/command-menu/pages/page-layout/types/TypedPieChartConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartLayout,
  GraphOrderBy,
  type IframeConfiguration,
  type StandaloneRichTextConfiguration,
  type WidgetConfiguration,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated/graphql';

export const TEST_FIELD_METADATA_ID_1 = '20202020-1111-4111-a111-111111111111';
export const TEST_FIELD_METADATA_ID_2 = '20202020-2222-4222-a222-222222222222';
export const TEST_FIELD_METADATA_ID_3 = '20202020-3333-4333-a333-333333333333';
export const TEST_OBJECT_METADATA_ID = '20202020-0000-4000-a000-000000000000';

export const TEST_BAR_CHART_CONFIGURATION: TypedBarChartConfiguration = {
  __typename: 'BarChartConfiguration',
  configurationType: WidgetConfigurationType.BAR_CHART,
  layout: BarChartLayout.VERTICAL,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
};

export const TEST_BAR_CHART_CONFIGURATION_HORIZONTAL: TypedBarChartConfiguration =
  {
    ...TEST_BAR_CHART_CONFIGURATION,
    layout: BarChartLayout.HORIZONTAL,
  };

export const TEST_LINE_CHART_CONFIGURATION: TypedLineChartConfiguration = {
  __typename: 'LineChartConfiguration',
  configurationType: WidgetConfigurationType.LINE_CHART,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.AVG,
  primaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
  displayDataLabel: true,
  axisNameDisplay: AxisNameDisplay.NONE,
};

export const TEST_PIE_CHART_CONFIGURATION: TypedPieChartConfiguration = {
  __typename: 'PieChartConfiguration',
  configurationType: WidgetConfigurationType.PIE_CHART,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.COUNT,
  groupByFieldMetadataId: TEST_FIELD_METADATA_ID_2,
  groupBySubFieldName: null,
  dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
  orderBy: GraphOrderBy.VALUE_DESC,
  displayDataLabel: true,
};

export const TEST_AGGREGATE_CHART_CONFIGURATION: TypedAggregateChartConfiguration =
  {
    __typename: 'AggregateChartConfiguration',
    configurationType: WidgetConfigurationType.AGGREGATE_CHART,
    aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
    aggregateOperation: AggregateOperations.COUNT,
    displayDataLabel: false,
  };

export const TEST_GAUGE_CHART_CONFIGURATION: TypedGaugeChartConfiguration = {
  __typename: 'GaugeChartConfiguration',
  configurationType: WidgetConfigurationType.GAUGE_CHART,
  aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
  aggregateOperation: AggregateOperations.SUM,
  displayDataLabel: false,
};

export const TEST_IFRAME_CONFIGURATION: IframeConfiguration = {
  __typename: 'IframeConfiguration',
  configurationType: WidgetConfigurationType.IFRAME,
  url: 'https://example.com/dashboard',
};

export const TEST_STANDALONE_RICH_TEXT_CONFIGURATION: StandaloneRichTextConfiguration =
  {
    __typename: 'StandaloneRichTextConfiguration',
    configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
    body: { markdown: 'Hello world' },
  };

export const TEST_FIELDS_CONFIGURATION = {
  __typename: 'FieldsConfiguration' as const,
  configurationType: 'FIELDS' as const,
  sections: [],
};

export const ALL_CHART_CONFIGURATIONS: WidgetConfiguration[] = [
  TEST_BAR_CHART_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_GAUGE_CHART_CONFIGURATION,
];

export const ALL_NON_CHART_CONFIGURATIONS = [
  TEST_IFRAME_CONFIGURATION,
  TEST_STANDALONE_RICH_TEXT_CONFIGURATION,
  TEST_FIELDS_CONFIGURATION,
] as const;

export const createTestWidget = (
  overrides: Partial<PageLayoutWidget> = {},
): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  id: 'widget-1',
  pageLayoutTabId: 'tab-1',
  title: 'Test Widget',
  type: WidgetType.GRAPH,
  gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
  objectMetadataId: TEST_OBJECT_METADATA_ID,
  configuration: TEST_BAR_CHART_CONFIGURATION,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  deletedAt: null,
  ...overrides,
});
