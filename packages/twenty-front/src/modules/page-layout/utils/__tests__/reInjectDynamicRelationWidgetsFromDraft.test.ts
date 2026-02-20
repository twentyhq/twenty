import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { DYNAMIC_RELATION_WIDGET_ID_PREFIX } from '@/page-layout/utils/isDynamicRelationWidget';
import { reInjectDynamicRelationWidgetsFromDraft } from '@/page-layout/utils/reInjectDynamicRelationWidgetsFromDraft';
import { WidgetType } from '~/generated-metadata/graphql';

const makeWidget = (
  overrides: Partial<PageLayoutWidget> & { id: string },
): PageLayoutWidget =>
  ({
    title: 'Widget',
    type: WidgetType.FIELDS,
    pageLayoutTabId: 'tab-1',
    gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    configuration: {},
    ...overrides,
  }) as PageLayoutWidget;

const makeDynamicRelationWidget = (suffix: string): PageLayoutWidget =>
  makeWidget({
    id: `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}${suffix}`,
    type: WidgetType.VIEW,
    title: `Dynamic Relation ${suffix}`,
  });

const makeServerLayout = (tabs: PageLayout['tabs']): PageLayout =>
  ({
    id: 'layout-1',
    name: 'Layout',
    type: 'RECORD_PAGE',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    tabs,
  }) as PageLayout;

const makeDraftLayout = (tabs: DraftPageLayout['tabs']): DraftPageLayout =>
  ({
    id: 'layout-1',
    name: 'Layout',
    type: 'RECORD_PAGE',
    tabs,
  }) as DraftPageLayout;

const makeTab = (
  id: string,
  widgets: PageLayoutWidget[],
): PageLayout['tabs'][number] =>
  ({
    id,
    title: 'Tab',
    position: 0,
    pageLayoutId: 'layout-1',
    applicationId: 'app-1',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    widgets,
  }) as PageLayout['tabs'][number];

describe('reInjectDynamicRelationWidgetsFromDraft', () => {
  it('should return server layout unchanged when draft has no dynamic widgets', () => {
    const serverLayout = makeServerLayout([
      makeTab('tab-1', [makeWidget({ id: 'w1' })]),
    ]);
    const draft = makeDraftLayout([
      makeTab('tab-1', [makeWidget({ id: 'w1' })]),
    ]);

    const result = reInjectDynamicRelationWidgetsFromDraft(serverLayout, draft);

    expect(result).toBe(serverLayout);
  });

  it('should inject dynamic widgets after the first FIELDS widget', () => {
    const fieldsWidget = makeWidget({
      id: 'fields-1',
      type: WidgetType.FIELDS,
    });
    const timelineWidget = makeWidget({
      id: 'timeline-1',
      type: WidgetType.TIMELINE,
    });
    const dynamicWidget = makeDynamicRelationWidget('relation-1');

    const serverLayout = makeServerLayout([
      makeTab('tab-1', [fieldsWidget, timelineWidget]),
    ]);
    const draft = makeDraftLayout([
      makeTab('tab-1', [fieldsWidget, dynamicWidget, timelineWidget]),
    ]);

    const result = reInjectDynamicRelationWidgetsFromDraft(serverLayout, draft);

    expect(result.tabs[0].widgets).toHaveLength(3);
    expect(result.tabs[0].widgets[0].id).toBe('fields-1');
    expect(result.tabs[0].widgets[1].id).toBe(
      `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}relation-1`,
    );
    expect(result.tabs[0].widgets[2].id).toBe('timeline-1');
  });

  it('should append dynamic widgets if no FIELDS widget exists in the tab', () => {
    const timelineWidget = makeWidget({
      id: 'timeline-1',
      type: WidgetType.TIMELINE,
    });
    const dynamicWidget = makeDynamicRelationWidget('relation-1');

    const serverLayout = makeServerLayout([makeTab('tab-1', [timelineWidget])]);
    const draft = makeDraftLayout([
      makeTab('tab-1', [timelineWidget, dynamicWidget]),
    ]);

    const result = reInjectDynamicRelationWidgetsFromDraft(serverLayout, draft);

    expect(result.tabs[0].widgets).toHaveLength(2);
    expect(result.tabs[0].widgets[0].id).toBe('timeline-1');
    expect(result.tabs[0].widgets[1].id).toBe(
      `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}relation-1`,
    );
  });

  it('should handle multiple tabs independently', () => {
    const fieldsWidget1 = makeWidget({
      id: 'fields-1',
      type: WidgetType.FIELDS,
    });
    const fieldsWidget2 = makeWidget({
      id: 'fields-2',
      type: WidgetType.FIELDS,
    });
    const dynamicWidget = makeDynamicRelationWidget('rel-1');

    const serverLayout = makeServerLayout([
      makeTab('tab-1', [fieldsWidget1]),
      makeTab('tab-2', [fieldsWidget2]),
    ]);
    const draft = makeDraftLayout([
      makeTab('tab-1', [fieldsWidget1, dynamicWidget]),
      makeTab('tab-2', [fieldsWidget2]),
    ]);

    const result = reInjectDynamicRelationWidgetsFromDraft(serverLayout, draft);

    // Tab 1 should have dynamic widget injected
    expect(result.tabs[0].widgets).toHaveLength(2);
    // Tab 2 should remain unchanged
    expect(result.tabs[1].widgets).toHaveLength(1);
  });

  it('should inject multiple dynamic widgets', () => {
    const fieldsWidget = makeWidget({
      id: 'fields-1',
      type: WidgetType.FIELDS,
    });
    const dynamicWidget1 = makeDynamicRelationWidget('rel-1');
    const dynamicWidget2 = makeDynamicRelationWidget('rel-2');

    const serverLayout = makeServerLayout([makeTab('tab-1', [fieldsWidget])]);
    const draft = makeDraftLayout([
      makeTab('tab-1', [fieldsWidget, dynamicWidget1, dynamicWidget2]),
    ]);

    const result = reInjectDynamicRelationWidgetsFromDraft(serverLayout, draft);

    expect(result.tabs[0].widgets).toHaveLength(3);
    expect(result.tabs[0].widgets[0].id).toBe('fields-1');
    expect(result.tabs[0].widgets[1].id).toBe(
      `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}rel-1`,
    );
    expect(result.tabs[0].widgets[2].id).toBe(
      `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}rel-2`,
    );
  });
});
