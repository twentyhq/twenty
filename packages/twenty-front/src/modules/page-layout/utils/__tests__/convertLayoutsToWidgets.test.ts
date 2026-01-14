import {
  AggregateOperations,
  GraphOrderBy,
  WidgetConfigurationType,
  WidgetType,
  type PageLayoutWidget,
} from '~/generated-metadata/graphql';
import { convertLayoutsToWidgets } from '@/page-layout/utils/convertLayoutsToWidgets';

describe('convertLayoutsToWidgets', () => {
  const mockWidgets: PageLayoutWidget[] = [
    {
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'Widget 1',
      type: WidgetType.GRAPH,
      objectMetadataId: null,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 2,
      },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
    {
      id: 'widget-2',
      pageLayoutTabId: 'tab-1',
      title: 'Widget 2',
      type: WidgetType.GRAPH,
      objectMetadataId: null,
      gridPosition: {
        row: 0,
        column: 2,
        rowSpan: 2,
        columnSpan: 2,
      },
      configuration: {
        configurationType: WidgetConfigurationType.PIE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: 'id',
        groupByFieldMetadataId: 'status',
        orderBy: GraphOrderBy.VALUE_DESC,
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
  ];

  it('should map layout positions to widgets', () => {
    const layouts = {
      desktop: [
        { i: 'widget-1', x: 2, y: 3, w: 4, h: 5 },
        { i: 'widget-2', x: 6, y: 7, w: 8, h: 9 },
      ],
    };

    const result = convertLayoutsToWidgets(mockWidgets, layouts);

    expect(result[0].gridPosition).toEqual({
      column: 2,
      row: 3,
      columnSpan: 4,
      rowSpan: 5,
    });
    expect(result[1].gridPosition).toEqual({
      column: 6,
      row: 7,
      columnSpan: 8,
      rowSpan: 9,
    });
  });

  it('should use defaults when layout not found', () => {
    const layouts = {
      desktop: [{ i: 'widget-1', x: 1, y: 1, w: 1, h: 1 }],
    };

    const result = convertLayoutsToWidgets(mockWidgets, layouts);

    expect(result[1].gridPosition).toEqual({
      column: 0,
      row: 0,
      columnSpan: 2,
      rowSpan: 2,
    });
  });

  it('should handle mobile layout', () => {
    const layouts = {
      mobile: [{ i: 'widget-1', x: 0, y: 4, w: 1, h: 6 }],
    };

    const result = convertLayoutsToWidgets(mockWidgets, layouts);

    expect(result[0].gridPosition).toEqual({
      column: 0,
      row: 4,
      columnSpan: 1,
      rowSpan: 6,
    });
  });
});
