import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { injectRelationWidgetsIntoLayout } from '@/page-layout/utils/injectRelationWidgetsIntoLayout';
import {
  FieldDisplayMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const createMockWidget = (
  id: string,
  type: WidgetType = WidgetType.FIELDS,
): PageLayoutWidget =>
  ({
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId: 'tab-1',
    title: `Widget ${id}`,
    type,
    objectMetadataId: null,
    gridPosition: {
      __typename: 'GridPosition',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 12,
    },
    position: {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: 'GRID',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 12,
    },
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: null,
    },
    isOverridden: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
  }) as PageLayoutWidget;

const createMockTab = (
  id: string,
  widgets: PageLayoutWidget[],
): PageLayoutTab =>
  ({
    __typename: 'PageLayoutTab',
    applicationId: '',
    id,
    pageLayoutId: 'page-layout-1',
    title: `Tab ${id}`,
    position: 0,
    widgets,
    isOverridden: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
  }) as PageLayoutTab;

const createMockLayout = (tabs: PageLayoutTab[]): PageLayout =>
  ({
    __typename: 'PageLayout',
    id: 'layout-1',
    tabs,
  }) as PageLayout;

const createMockFieldMetadataItem = (
  id: string,
  label: string,
): FieldMetadataItem =>
  ({
    id,
    label,
    name: label.toLowerCase(),
    type: 'RELATION',
  }) as FieldMetadataItem;

describe('injectRelationWidgetsIntoLayout', () => {
  it('should return layout unchanged when relation fields array is empty', () => {
    const layout = createMockLayout([
      createMockTab('tab-1', [createMockWidget('w1')]),
    ]);

    const result = injectRelationWidgetsIntoLayout(layout, []);

    expect(result).toBe(layout);
  });

  it('should return layout unchanged when there are no tabs', () => {
    const layout = createMockLayout([]);
    const fields = [createMockFieldMetadataItem('f1', 'Company')];

    const result = injectRelationWidgetsIntoLayout(layout, fields);

    expect(result).toBe(layout);
  });

  it('should append relation widgets when no FIELDS widget exists', () => {
    const otherWidget = createMockWidget('w1', WidgetType.TIMELINE);
    const layout = createMockLayout([createMockTab('tab-1', [otherWidget])]);
    const fields = [createMockFieldMetadataItem('f1', 'Company')];

    const result = injectRelationWidgetsIntoLayout(layout, fields);

    expect(result.tabs[0].widgets).toHaveLength(2);
    expect(result.tabs[0].widgets[0].id).toBe('w1');
    expect(result.tabs[0].widgets[1].id).toContain('dynamic-relation-widget-');
    expect(result.tabs[0].widgets[1].id).toContain('f1');
  });

  it('should inject relation widgets after the first FIELDS widget', () => {
    const fieldsWidget = createMockWidget('fields-1', WidgetType.FIELDS);
    const timelineWidget = createMockWidget('timeline-1', WidgetType.TIMELINE);
    const layout = createMockLayout([
      createMockTab('tab-1', [fieldsWidget, timelineWidget]),
    ]);
    const fields = [createMockFieldMetadataItem('f1', 'Company')];

    const result = injectRelationWidgetsIntoLayout(layout, fields);

    expect(result.tabs[0].widgets).toHaveLength(3);
    expect(result.tabs[0].widgets[0].id).toBe('fields-1');
    expect(result.tabs[0].widgets[1].id).toContain('f1');
    expect(result.tabs[0].widgets[2].id).toBe('timeline-1');
  });

  it('should reposition NOTES widget after relation widgets', () => {
    const fieldsWidget = createMockWidget('fields-1', WidgetType.FIELDS);
    const notesWidget = createMockWidget('notes-1', WidgetType.NOTES);
    const timelineWidget = createMockWidget('timeline-1', WidgetType.TIMELINE);
    const layout = createMockLayout([
      createMockTab('tab-1', [fieldsWidget, notesWidget, timelineWidget]),
    ]);
    const fields = [createMockFieldMetadataItem('f1', 'Company')];

    const result = injectRelationWidgetsIntoLayout(layout, fields);

    const widgetIds = result.tabs[0].widgets.map((w) => w.id);

    expect(widgetIds[0]).toBe('fields-1');
    expect(widgetIds[1]).toContain('f1');
    expect(widgetIds[2]).toBe('notes-1');
    expect(widgetIds[3]).toBe('timeline-1');
  });

  it('should only modify the first tab', () => {
    const layout = createMockLayout([
      createMockTab('tab-1', [createMockWidget('fields-1', WidgetType.FIELDS)]),
      createMockTab('tab-2', [createMockWidget('fields-2', WidgetType.FIELDS)]),
    ]);
    const fields = [createMockFieldMetadataItem('f1', 'Company')];

    const result = injectRelationWidgetsIntoLayout(layout, fields);

    expect(result.tabs[0].widgets).toHaveLength(2);
    expect(result.tabs[1].widgets).toHaveLength(1);
    expect(result.tabs[1].widgets[0].id).toBe('fields-2');
  });

  it('should inject multiple relation widgets in order', () => {
    const fieldsWidget = createMockWidget('fields-1', WidgetType.FIELDS);
    const layout = createMockLayout([createMockTab('tab-1', [fieldsWidget])]);
    const fields = [
      createMockFieldMetadataItem('f1', 'Company'),
      createMockFieldMetadataItem('f2', 'Person'),
    ];

    const result = injectRelationWidgetsIntoLayout(layout, fields);

    expect(result.tabs[0].widgets).toHaveLength(3);
    expect(result.tabs[0].widgets[0].id).toBe('fields-1');
    expect(result.tabs[0].widgets[1].id).toContain('f1');
    expect(result.tabs[0].widgets[2].id).toContain('f2');
  });

  it('should set correct properties on injected relation widgets', () => {
    const layout = createMockLayout([
      createMockTab('tab-1', [createMockWidget('fields-1', WidgetType.FIELDS)]),
    ]);
    const fields = [createMockFieldMetadataItem('f1', 'Company')];

    const result = injectRelationWidgetsIntoLayout(layout, fields);

    const injectedWidget = result.tabs[0].widgets[1];

    expect(injectedWidget.type).toBe(WidgetType.FIELD);
    expect(injectedWidget.title).toBe('Company');
    expect(injectedWidget.pageLayoutTabId).toBe('tab-1');
    expect(injectedWidget.configuration).toEqual(
      expect.objectContaining({
        fieldMetadataId: 'f1',
        fieldDisplayMode: FieldDisplayMode.CARD,
      }),
    );
  });
});
