import {
  AggregateOperations,
  GraphOrderBy,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';

describe('removeWidgetFromTab', () => {
  const mockTabs: PageLayoutTab[] = [
    {
      id: 'tab-1',
      title: 'Tab 1',
      position: 0,
      pageLayoutId: 'layout-1',
      widgets: [
        {
          __typename: 'PageLayoutWidget' as const,
          id: 'widget-1',
          pageLayoutTabId: 'tab-1',
          title: 'Widget 1',
          type: WidgetType.GRAPH,
          configuration: {
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateOperation: AggregateOperations.COUNT,
            aggregateFieldMetadataId: 'id',
            displayDataLabel: false,
          },
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
          objectMetadataId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        },
        {
          __typename: 'PageLayoutWidget' as const,
          id: 'widget-2',
          pageLayoutTabId: 'tab-1',
          title: 'Widget 2',
          type: WidgetType.GRAPH,
          configuration: {
            configurationType: WidgetConfigurationType.PIE_CHART,
            aggregateOperation: AggregateOperations.COUNT,
            aggregateFieldMetadataId: 'id',
            groupByFieldMetadataId: 'status',
            orderBy: GraphOrderBy.VALUE_DESC,
            displayDataLabel: false,
          },
          gridPosition: { row: 2, column: 0, rowSpan: 2, columnSpan: 2 },
          objectMetadataId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
    {
      id: 'tab-2',
      title: 'Tab 2',
      position: 1,
      pageLayoutId: 'layout-1',
      widgets: [
        {
          __typename: 'PageLayoutWidget' as const,
          id: 'widget-3',
          pageLayoutTabId: 'tab-2',
          title: 'Widget 3',
          type: WidgetType.IFRAME,
          configuration: {
            configurationType: WidgetConfigurationType.IFRAME,
            url: 'https://example.com',
          },
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
          objectMetadataId: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
  ];

  it('should remove widget from the correct tab', () => {
    const result = removeWidgetFromTab(mockTabs, 'tab-1', 'widget-1');

    expect(result[0].widgets).toHaveLength(1);
    expect(result[0].widgets[0].id).toBe('widget-2');
    expect(result[1].widgets).toHaveLength(1);
    expect(result[1].widgets[0].id).toBe('widget-3');
  });

  it('should not affect other tabs', () => {
    const result = removeWidgetFromTab(mockTabs, 'tab-1', 'widget-1');

    expect(result[1]).toEqual(mockTabs[1]);
    expect(result[1].widgets).toHaveLength(1);
  });

  it('should handle removing non-existent widget gracefully', () => {
    const result = removeWidgetFromTab(mockTabs, 'tab-1', 'non-existent');

    expect(result[0].widgets).toHaveLength(2);
    expect(result[0].widgets).toEqual(mockTabs[0].widgets);
  });

  it('should handle removing from non-existent tab gracefully', () => {
    const result = removeWidgetFromTab(mockTabs, 'non-existent', 'widget-1');

    expect(result).toEqual(mockTabs);
  });

  it('should remove all widgets if called multiple times', () => {
    let result = removeWidgetFromTab(mockTabs, 'tab-1', 'widget-1');
    result = removeWidgetFromTab(result, 'tab-1', 'widget-2');

    expect(result[0].widgets).toHaveLength(0);
    expect(result[1].widgets).toHaveLength(1);
  });

  it('should return a new array without mutating the original', () => {
    const originalTabs = structuredClone(mockTabs);
    const result = removeWidgetFromTab(mockTabs, 'tab-1', 'widget-1');

    expect(result).not.toBe(mockTabs);
    expect(mockTabs).toEqual(originalTabs);
    expect(result[0].widgets).toHaveLength(1);
  });
});
