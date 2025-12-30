import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { WidgetType } from '~/generated/graphql';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';

describe('filterVisibleWidgets', () => {
  const createMockWidget = (
    id: string,
    conditionalDisplay?: any,
  ): PageLayoutTab['widgets'][0] => ({
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId: 'tab-1',
    title: `Widget ${id}`,
    type: WidgetType.FIELDS,
    objectMetadataId: null,
    gridPosition: {
      __typename: 'GridPosition',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    },
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: 'FIELDS',
      sections: [],
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    conditionalDisplay,
  });

  it('should return all widgets when no conditionalDisplay is set', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2'),
      createMockWidget('widget-3'),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: { device: 'DESKTOP' },
    });

    expect(result).toHaveLength(3);
    expect(result).toEqual(widgets);
  });

  it('should filter out widgets that should be hidden on MOBILE', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
      createMockWidget('widget-3', {
        and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
      }),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: { device: 'MOBILE' },
    });

    expect(result).toHaveLength(2);
    expect(result.map((w) => w.id)).toEqual(['widget-1', 'widget-2']);
  });

  it('should filter out widgets that should be hidden on DESKTOP', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
      createMockWidget('widget-3', {
        and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
      }),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: { device: 'DESKTOP' },
    });

    expect(result).toHaveLength(2);
    expect(result.map((w) => w.id)).toEqual(['widget-1', 'widget-3']);
  });

  it('should handle empty widgets array', () => {
    const result = filterVisibleWidgets({
      widgets: [],
      context: { device: 'DESKTOP' },
    });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should not mutate the original widgets array', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
    ];
    const originalLength = widgets.length;

    filterVisibleWidgets({
      widgets,
      context: { device: 'DESKTOP' },
    });

    expect(widgets).toHaveLength(originalLength);
  });
});
