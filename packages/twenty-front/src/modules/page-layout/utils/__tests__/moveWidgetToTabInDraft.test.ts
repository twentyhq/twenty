import { moveWidgetToTabInDraft } from '@/page-layout/utils/moveWidgetToTabInDraft';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

const makeWidget = (
  id: string,
  index: number,
  tabId = 'tab-1',
): PageLayoutWidget =>
  ({
    id,
    pageLayoutTabId: tabId,
    title: id,
    isActive: true,
    type: WidgetType.FIELDS,
    gridPosition: { column: 0, columnSpan: 1, row: 0, rowSpan: 1 },
    configuration: { __typename: 'FieldsConfiguration' as const },
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
  }) as unknown as PageLayoutWidget;

const makeTab = (id: string, widgets: PageLayoutWidget[], position = 0) => ({
  id,
  applicationId: '',
  title: id,
  isActive: true,
  position,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  pageLayoutId: '',
  widgets,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

const makeDraft = (tabs: ReturnType<typeof makeTab>[]): DraftPageLayout => ({
  id: 'test-layout',
  name: 'Test Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  tabs,
});

const indicesOf = (draft: DraftPageLayout, tabIndex: number) =>
  draft.tabs[tabIndex].widgets.map((widget) =>
    widget.position && 'index' in widget.position ? widget.position.index : -1,
  );

describe('moveWidgetToTabInDraft', () => {
  it('appends the widget to the destination tab when no index is given', () => {
    const draft = makeDraft([
      makeTab('tab-1', [makeWidget('widget-a', 0), makeWidget('widget-b', 1)]),
      makeTab('tab-2', [makeWidget('widget-x', 0, 'tab-2')], 1),
    ]);

    const result = moveWidgetToTabInDraft(draft, {
      widgetId: 'widget-a',
      destinationTabId: 'tab-2',
    });

    expect(result.tabs[0].widgets.map((w) => w.id)).toEqual(['widget-b']);
    expect(result.tabs[1].widgets.map((w) => w.id)).toEqual([
      'widget-x',
      'widget-a',
    ]);
    const moved = result.tabs[1].widgets.find((w) => w.id === 'widget-a');
    expect(moved?.position).toEqual(expect.objectContaining({ index: 1 }));
    expect(moved?.pageLayoutTabId).toBe('tab-2');
  });

  it('reindexes the remaining widgets in the source tab', () => {
    const draft = makeDraft([
      makeTab('tab-1', [
        makeWidget('widget-a', 0),
        makeWidget('widget-b', 1),
        makeWidget('widget-c', 2),
      ]),
      makeTab('tab-2', [], 1),
    ]);

    const result = moveWidgetToTabInDraft(draft, {
      widgetId: 'widget-a',
      destinationTabId: 'tab-2',
    });

    expect(indicesOf(result, 0)).toEqual([0, 1]);
  });

  it('inserts the widget at the given destination index and reindexes', () => {
    const draft = makeDraft([
      makeTab('tab-1', [makeWidget('widget-a', 0)]),
      makeTab(
        'tab-2',
        [
          makeWidget('widget-x', 0, 'tab-2'),
          makeWidget('widget-y', 1, 'tab-2'),
        ],
        1,
      ),
    ]);

    const result = moveWidgetToTabInDraft(draft, {
      widgetId: 'widget-a',
      destinationTabId: 'tab-2',
      destinationIndex: 1,
    });

    expect(result.tabs[1].widgets.map((w) => w.id)).toEqual([
      'widget-x',
      'widget-a',
      'widget-y',
    ]);
    expect(indicesOf(result, 1)).toEqual([0, 1, 2]);
  });

  it('clamps an out-of-range destination index', () => {
    const draft = makeDraft([
      makeTab('tab-1', [makeWidget('widget-a', 0)]),
      makeTab('tab-2', [makeWidget('widget-x', 0, 'tab-2')], 1),
    ]);

    const result = moveWidgetToTabInDraft(draft, {
      widgetId: 'widget-a',
      destinationTabId: 'tab-2',
      destinationIndex: 99,
    });

    expect(result.tabs[1].widgets.map((w) => w.id)).toEqual([
      'widget-x',
      'widget-a',
    ]);
  });

  it('returns the draft unchanged for a same-tab move', () => {
    const draft = makeDraft([
      makeTab('tab-1', [makeWidget('widget-a', 0), makeWidget('widget-b', 1)]),
    ]);

    expect(
      moveWidgetToTabInDraft(draft, {
        widgetId: 'widget-a',
        destinationTabId: 'tab-1',
      }),
    ).toBe(draft);
  });

  it('returns the draft unchanged when the widget is missing', () => {
    const draft = makeDraft([
      makeTab('tab-1', [makeWidget('widget-a', 0)]),
      makeTab('tab-2', [], 1),
    ]);

    expect(
      moveWidgetToTabInDraft(draft, {
        widgetId: 'missing',
        destinationTabId: 'tab-2',
      }),
    ).toBe(draft);
  });

  it('returns the draft unchanged when the destination tab is missing', () => {
    const draft = makeDraft([makeTab('tab-1', [makeWidget('widget-a', 0)])]);

    expect(
      moveWidgetToTabInDraft(draft, {
        widgetId: 'widget-a',
        destinationTabId: 'missing',
      }),
    ).toBe(draft);
  });
});
