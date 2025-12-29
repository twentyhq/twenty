import { WidgetType } from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  WidgetConfigurationType,
  type PageLayoutWidget,
} from '~/generated/graphql';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { addWidgetToTab } from '@/page-layout/utils/addWidgetToTab';

describe('addWidgetToTab', () => {
  const mockWidget: PageLayoutWidget = {
    __typename: 'PageLayoutWidget',
    id: 'widget-1',
    pageLayoutTabId: 'tab-1',
    title: 'Test Widget',
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
  };

  const mockTabs: PageLayoutTab[] = [
    {
      id: 'tab-1',
      title: 'Tab 1',
      position: 0,
      pageLayoutId: 'layout-1',
      widgets: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
    {
      id: 'tab-2',
      title: 'Tab 2',
      position: 1,
      pageLayoutId: 'layout-1',
      widgets: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
  ];

  it('should add widget to the correct tab', () => {
    const result = addWidgetToTab(mockTabs, 'tab-1', mockWidget);

    expect(result[0].widgets).toHaveLength(1);
    expect(result[0].widgets?.[0]).toEqual(mockWidget);
    expect(result[1].widgets).toHaveLength(0);
  });

  it('should not modify other tabs', () => {
    const result = addWidgetToTab(mockTabs, 'tab-1', mockWidget);

    expect(result[1]).toEqual(mockTabs[1]);
    expect(result[1].widgets).toHaveLength(0);
  });

  it('should handle non-existent tab ID gracefully', () => {
    const result = addWidgetToTab(mockTabs, 'non-existent-tab', mockWidget);

    // All tabs should remain unchanged
    expect(result[0].widgets).toHaveLength(0);
    expect(result[1].widgets).toHaveLength(0);
  });

  it('should add multiple widgets to the same tab', () => {
    const secondWidget: PageLayoutWidget = {
      ...mockWidget,
      id: 'widget-2',
      title: 'Second Widget',
    };

    let result = addWidgetToTab(mockTabs, 'tab-1', mockWidget);
    result = addWidgetToTab(result, 'tab-1', secondWidget);

    expect(result[0].widgets).toHaveLength(2);
    expect(result[0].widgets?.[0]).toEqual(mockWidget);
    expect(result[0].widgets?.[1]).toEqual(secondWidget);
  });

  it('should return a new array without mutating the original', () => {
    const result = addWidgetToTab(mockTabs, 'tab-1', mockWidget);

    expect(result).not.toBe(mockTabs);
    expect(mockTabs[0].widgets).toHaveLength(0);
    expect(result[0].widgets).toHaveLength(1);
  });
});
