import { moveWidgetWithinTabInDraft } from '@/page-layout/utils/moveWidgetWithinTabInDraft';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

const makeWidget = (id: string, index: number): PageLayoutWidget =>
  ({
    id,
    pageLayoutTabId: 'tab-1',
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

const makeDraft = (widgets: PageLayoutWidget[]): DraftPageLayout => ({
  id: 'test-layout',
  name: 'Test Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  tabs: [
    {
      id: 'tab-1',
      applicationId: '',
      title: 'tab-1',
      isActive: true,
      position: 0,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      pageLayoutId: '',
      widgets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
  ],
});

const orderOf = (draft: DraftPageLayout) =>
  draft.tabs[0].widgets.map((widget) => widget.id);

const indicesOf = (draft: DraftPageLayout) =>
  draft.tabs[0].widgets.map((widget) =>
    widget.position && 'index' in widget.position ? widget.position.index : -1,
  );

describe('moveWidgetWithinTabInDraft', () => {
  it('moves a widget down and reindexes', () => {
    const draft = makeDraft([
      makeWidget('widget-a', 0),
      makeWidget('widget-b', 1),
      makeWidget('widget-c', 2),
    ]);

    const result = moveWidgetWithinTabInDraft(draft, {
      tabId: 'tab-1',
      fromIndex: 0,
      toIndex: 2,
    });

    expect(orderOf(result)).toEqual(['widget-b', 'widget-c', 'widget-a']);
    expect(indicesOf(result)).toEqual([0, 1, 2]);
  });

  it('moves a widget up and reindexes', () => {
    const draft = makeDraft([
      makeWidget('widget-a', 0),
      makeWidget('widget-b', 1),
      makeWidget('widget-c', 2),
    ]);

    const result = moveWidgetWithinTabInDraft(draft, {
      tabId: 'tab-1',
      fromIndex: 2,
      toIndex: 0,
    });

    expect(orderOf(result)).toEqual(['widget-c', 'widget-a', 'widget-b']);
    expect(indicesOf(result)).toEqual([0, 1, 2]);
  });

  it('sorts by position before applying the move regardless of array order', () => {
    const draft = makeDraft([
      makeWidget('widget-c', 2),
      makeWidget('widget-a', 0),
      makeWidget('widget-b', 1),
    ]);

    const result = moveWidgetWithinTabInDraft(draft, {
      tabId: 'tab-1',
      fromIndex: 0,
      toIndex: 1,
    });

    expect(orderOf(result)).toEqual(['widget-b', 'widget-a', 'widget-c']);
    expect(indicesOf(result)).toEqual([0, 1, 2]);
  });

  it('returns the draft unchanged when indices are equal', () => {
    const draft = makeDraft([makeWidget('widget-a', 0)]);

    expect(
      moveWidgetWithinTabInDraft(draft, {
        tabId: 'tab-1',
        fromIndex: 0,
        toIndex: 0,
      }),
    ).toBe(draft);
  });

  it('returns the draft unchanged when an index is out of range', () => {
    const draft = makeDraft([makeWidget('widget-a', 0)]);

    expect(
      moveWidgetWithinTabInDraft(draft, {
        tabId: 'tab-1',
        fromIndex: 0,
        toIndex: 5,
      }),
    ).toBe(draft);
  });

  it('returns the draft unchanged when the tab is missing', () => {
    const draft = makeDraft([makeWidget('widget-a', 0)]);

    expect(
      moveWidgetWithinTabInDraft(draft, {
        tabId: 'missing',
        fromIndex: 0,
        toIndex: 0,
      }),
    ).toBe(draft);
  });
});
