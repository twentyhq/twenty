import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated/graphql';
import { createDefaultGraphWidget } from '@/page-layout/utils/createDefaultGraphWidget';

describe('createDefaultGraphWidget', () => {
  const baseParams = {
    id: 'widget-1',
    pageLayoutTabId: 'tab-1',
    title: 'Test Widget',
    gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
    objectMetadataId: 'object-1',
  };

  describe('VERTICAL_BAR graph type', () => {
    it('should create widget with bar chart configuration when all fields are provided', () => {
      const widget = createDefaultGraphWidget({
        ...baseParams,
        fieldSelection: {
          aggregateFieldMetadataId: 'field-1',
          groupByFieldMetadataIdX: 'field-2',
        },
      });

      expect(widget.configuration).toEqual({
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        displayDataLabel: false,
        color: 'blue',
        primaryAxisGroupByFieldMetadataId: 'field-2',
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
      });
    });

    it('should use objectMetadataId from fieldSelection over params', () => {
      const widget = createDefaultGraphWidget({
        ...baseParams,
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
});
