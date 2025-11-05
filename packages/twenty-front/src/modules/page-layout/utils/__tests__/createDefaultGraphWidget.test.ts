import {
  AggregateOperations,
  AxisNameDisplay,
  GraphOrderBy,
  GraphType,
  WidgetType,
} from '~/generated/graphql';
import { createDefaultGraphWidget } from '../createDefaultGraphWidget';

describe('createDefaultGraphWidget', () => {
  const baseParams = {
    id: 'widget-1',
    pageLayoutTabId: 'tab-1',
    title: 'Test Widget',
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
    objectMetadataId: 'object-1',
  };

  describe('AGGREGATE graph type', () => {
    it('should create widget with aggregate configuration when field is provided', () => {
      const widget = createDefaultGraphWidget({
        ...baseParams,
        graphType: GraphType.AGGREGATE,
        fieldSelection: {
          aggregateFieldMetadataId: 'field-1',
        },
      });

      expect(widget.type).toBe(WidgetType.GRAPH);
      expect(widget.configuration).toEqual({
        __typename: 'AggregateChartConfiguration',
        graphType: GraphType.AGGREGATE,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: true,
      });
    });

    it('should return null configuration when field is missing', () => {
      const widget = createDefaultGraphWidget({
        ...baseParams,
        graphType: GraphType.AGGREGATE,
      });

      expect(widget.configuration).toBeNull();
    });
  });

  describe('VERTICAL_BAR graph type', () => {
    it('should create widget with bar chart configuration when all fields are provided', () => {
      const widget = createDefaultGraphWidget({
        ...baseParams,
        graphType: GraphType.VERTICAL_BAR,
        fieldSelection: {
          aggregateFieldMetadataId: 'field-1',
          groupByFieldMetadataIdX: 'field-2',
        },
      });

      expect(widget.configuration).toEqual({
        __typename: 'BarChartConfiguration',
        graphType: GraphType.VERTICAL_BAR,
        displayDataLabel: false,
        color: 'blue',
        primaryAxisGroupByFieldMetadataId: 'field-2',
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
      });
    });

    it('should return null configuration when required fields are missing', () => {
      const widget = createDefaultGraphWidget({
        ...baseParams,
        graphType: GraphType.VERTICAL_BAR,
        fieldSelection: {
          aggregateFieldMetadataId: 'field-1',
          // Missing groupByFieldMetadataIdX
        },
      });

      expect(widget.configuration).toBeNull();
    });
  });

  describe('HORIZONTAL_BAR graph type', () => {
    it('should create widget with horizontal bar configuration', () => {
      const widget = createDefaultGraphWidget({
        ...baseParams,
        graphType: GraphType.HORIZONTAL_BAR,
        fieldSelection: {
          aggregateFieldMetadataId: 'field-1',
          groupByFieldMetadataIdX: 'field-2',
        },
      });

      expect(widget.configuration?.__typename).toBe('BarChartConfiguration');
      if (widget.configuration?.__typename === 'BarChartConfiguration') {
        expect(widget.configuration.graphType).toBe(GraphType.HORIZONTAL_BAR);
      }
    });
  });

  describe('Unsupported graph types', () => {
    it.each([GraphType.PIE, GraphType.LINE, GraphType.GAUGE])(
      'should return null configuration for %s graph type',
      (graphType) => {
        const widget = createDefaultGraphWidget({
          ...baseParams,
          graphType,
          fieldSelection: {
            aggregateFieldMetadataId: 'field-1',
            groupByFieldMetadataIdX: 'field-2',
          },
        });

        expect(widget.configuration).toBeNull();
      },
    );
  });

  it('should use objectMetadataId from fieldSelection over params', () => {
    const widget = createDefaultGraphWidget({
      ...baseParams,
      graphType: GraphType.AGGREGATE,
      objectMetadataId: 'object-1',
      fieldSelection: {
        aggregateFieldMetadataId: 'field-1',
        objectMetadataId: 'object-2',
      },
    });

    expect(widget.objectMetadataId).toBe('object-2');
  });

  it('should set timestamps and common widget properties', () => {
    const widget = createDefaultGraphWidget({
      ...baseParams,
      graphType: GraphType.AGGREGATE,
      fieldSelection: {
        aggregateFieldMetadataId: 'field-1',
      },
    });

    expect(widget.__typename).toBe('PageLayoutWidget');
    expect(widget.id).toBe('widget-1');
    expect(widget.pageLayoutTabId).toBe('tab-1');
    expect(widget.title).toBe('Test Widget');
    expect(widget.gridPosition).toEqual(baseParams.gridPosition);
    expect(widget.createdAt).toBeDefined();
    expect(widget.updatedAt).toBeDefined();
    expect(widget.deletedAt).toBeNull();
  });
});
