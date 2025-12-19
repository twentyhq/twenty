import {
  type PageLayoutWidget,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  AxisNameDisplay,
  GraphOrderBy,
  type WidgetConfiguration,
  WidgetConfigurationType,
} from '~/generated/graphql';
import { extractFieldMetadataIdsFromWidget } from '../extractFieldMetadataIdsFromWidget';

const createMockWidget = (
  overrides: Partial<Omit<PageLayoutWidget, 'configuration'>> & {
    configuration: WidgetConfiguration;
  },
): PageLayoutWidget => ({
  id: 'widget-1',
  type: WidgetType.GRAPH,
  title: 'Test',
  objectMetadataId: null,
  gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  pageLayoutTabId: 'tab-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
});

describe('extractFieldMetadataIdsFromWidget', () => {
  it('should return empty array for IFRAME widget', () => {
    const widget = createMockWidget({
      type: WidgetType.IFRAME,
      configuration: {
        __typename: 'IframeConfiguration' as const,
        configurationType: WidgetConfigurationType.IFRAME,
        url: 'https://example.com',
      },
    });

    expect(extractFieldMetadataIdsFromWidget(widget)).toEqual([]);
  });

  it('should extract field IDs from BarChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'BarChartConfiguration' as const,
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: 'field-2',
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      objectMetadataId: 'object-1',
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).toContain('field-1');
    expect(result).toContain('field-2');
  });

  it('should extract field IDs from BarChartConfiguration with optional Y grouping', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'BarChartConfiguration' as const,
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: 'field-2',
        secondaryAxisGroupByFieldMetadataId: 'field-3',
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      objectMetadataId: 'object-1',
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(3);
    expect(result).toContain('field-1');
    expect(result).toContain('field-2');
    expect(result).toContain('field-3');
  });

  it('should extract field IDs from LineChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'LineChartConfiguration' as const,
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: 'field-2',
        primaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      objectMetadataId: 'object-1',
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).toContain('field-1');
    expect(result).toContain('field-2');
  });

  it('should extract field IDs from PieChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'PieChartConfiguration' as const,
        configurationType: WidgetConfigurationType.PIE_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataId: 'field-2',
        orderBy: GraphOrderBy.FIELD_ASC,
        displayDataLabel: false,
      },
      objectMetadataId: 'object-1',
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).toContain('field-1');
    expect(result).toContain('field-2');
  });

  it('should extract field IDs from AggregateChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'AggregateChartConfiguration' as const,
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.AVG,
        displayDataLabel: false,
      },
      objectMetadataId: 'object-1',
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(1);
    expect(result).toContain('field-1');
  });

  it('should extract field IDs from GaugeChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'GaugeChartConfiguration' as const,
        configurationType: WidgetConfigurationType.GAUGE_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
      },
      objectMetadataId: 'object-1',
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(1);
    expect(result).toContain('field-1');
  });

  it('should not include undefined optional fields', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'BarChartConfiguration' as const,
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: 'field-2',
        secondaryAxisGroupByFieldMetadataId: undefined,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      objectMetadataId: 'object-1',
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).not.toContain(undefined);
  });
});
