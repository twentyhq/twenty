import {
  type PageLayoutWidget,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  AxisNameDisplay,
  ExtendedAggregateOperations,
  GraphOrderBy,
  GraphType,
} from '~/generated/graphql';
import { extractFieldMetadataIdsFromWidget } from '../extractFieldMetadataIdsFromWidget';

const createMockWidget = (
  overrides: Partial<PageLayoutWidget>,
): PageLayoutWidget => ({
  id: 'widget-1',
  type: WidgetType.GRAPH,
  title: 'Test',
  configuration: null,
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
        url: 'https://example.com',
      },
    });

    expect(extractFieldMetadataIdsFromWidget(widget)).toEqual([]);
  });

  it('should return empty array for widget without configuration', () => {
    const widget = createMockWidget({
      configuration: null,
    });

    expect(extractFieldMetadataIdsFromWidget(widget)).toEqual([]);
  });

  it('should extract field IDs from BarChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'BarChartConfiguration' as const,
        graphType: GraphType.VERTICAL_BAR,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        primaryAxisGroup: 'field-2',
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
        graphType: GraphType.VERTICAL_BAR,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        primaryAxisGroup: 'field-2',
        secondaryAxisGroup: 'field-3',
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
        graphType: GraphType.LINE,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: ExtendedAggregateOperations.SUM,
        primaryAxisGroup: 'field-2',
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
        graphType: GraphType.PIE,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: ExtendedAggregateOperations.COUNT,
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

  it('should extract field IDs from NumberChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: {
        __typename: 'NumberChartConfiguration' as const,
        graphType: GraphType.NUMBER,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: ExtendedAggregateOperations.AVG,
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
        graphType: GraphType.GAUGE,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: ExtendedAggregateOperations.SUM,
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
        graphType: GraphType.VERTICAL_BAR,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: ExtendedAggregateOperations.COUNT,
        primaryAxisGroup: 'field-2',
        secondaryAxisGroup: undefined,
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
