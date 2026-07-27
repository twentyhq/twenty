import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { moveWidgetToGridTabInDraft } from '@/page-layout/utils/moveWidgetToGridTabInDraft';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const makeGridWidget = (
  id: string,
  tabId: string,
  gridPosition: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  },
): PageLayoutWidget => ({
  ...makeWidget(id, 0, tabId),
  gridPosition,
  position: {
    __typename: 'PageLayoutWidgetGridPosition' as const,
    layoutMode: PageLayoutTabLayoutMode.GRID,
    ...gridPosition,
  },
});

const makeGridTab = (id: string, widgets: PageLayoutWidget[], position = 0) =>
  makeTab(id, widgets, position, PageLayoutTabLayoutMode.GRID);

describe('moveWidgetToGridTabInDraft', () => {
  it('moves the widget below the lowest widget of the destination grid', () => {
    const draft = makeDraft([
      makeGridTab('tab-1', [
        makeGridWidget('widget-a', 'tab-1', {
          row: 0,
          column: 0,
          rowSpan: 4,
          columnSpan: 6,
        }),
      ]),
      makeGridTab(
        'tab-2',
        [
          makeGridWidget('widget-b', 'tab-2', {
            row: 2,
            column: 3,
            rowSpan: 5,
            columnSpan: 4,
          }),
        ],
        1,
      ),
    ]);

    const result = moveWidgetToGridTabInDraft(draft, {
      widgetId: 'widget-a',
      destinationTabId: 'tab-2',
    });

    expect(result.tabs[0].widgets).toHaveLength(0);
    expect(result.tabs[1].widgets.map((widget) => widget.id)).toEqual([
      'widget-b',
      'widget-a',
    ]);

    const movedWidget = result.tabs[1].widgets.find(
      (widget) => widget.id === 'widget-a',
    );
    expect(movedWidget?.pageLayoutTabId).toBe('tab-2');
    expect(movedWidget?.gridPosition).toEqual({
      row: 7,
      column: 0,
      rowSpan: 4,
      columnSpan: 6,
    });
  });

  it('places the widget at the top of an empty destination grid', () => {
    const draft = makeDraft([
      makeGridTab('tab-1', [
        makeGridWidget('widget-a', 'tab-1', {
          row: 3,
          column: 2,
          rowSpan: 2,
          columnSpan: 2,
        }),
      ]),
      makeGridTab('tab-2', [], 1),
    ]);

    const result = moveWidgetToGridTabInDraft(draft, {
      widgetId: 'widget-a',
      destinationTabId: 'tab-2',
    });

    const movedWidget = result.tabs[1].widgets[0];
    expect(movedWidget?.gridPosition).toEqual({
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 2,
    });
  });

  it('rejects vertical-list destinations and no-op moves', () => {
    const draft = makeDraft([
      makeGridTab('tab-1', [
        makeGridWidget('widget-a', 'tab-1', {
          row: 0,
          column: 0,
          rowSpan: 2,
          columnSpan: 2,
        }),
      ]),
      makeTab('tab-vertical', [], 1),
    ]);

    expect(
      moveWidgetToGridTabInDraft(draft, {
        widgetId: 'widget-a',
        destinationTabId: 'tab-vertical',
      }),
    ).toBe(draft);
    expect(
      moveWidgetToGridTabInDraft(draft, {
        widgetId: 'widget-a',
        destinationTabId: 'tab-1',
      }),
    ).toBe(draft);
    expect(
      moveWidgetToGridTabInDraft(draft, {
        widgetId: 'missing',
        destinationTabId: 'tab-1',
      }),
    ).toBe(draft);
  });
});
