import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { computeCanvasRecordPageTabsToVerticalList } from 'src/database/commands/upgrade-version-command/2-23/utils/compute-canvas-record-page-tabs-to-vertical-list.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const makeTab = (
  overrides: Partial<FlatPageLayoutTab>,
): FlatPageLayoutTab =>
  ({
    id: 'tab',
    pageLayoutId: 'record-layout',
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
    applicationUniversalIdentifier: 'app',
    ...overrides,
  }) as FlatPageLayoutTab;

const makeWidget = (
  overrides: Partial<FlatPageLayoutWidget>,
): FlatPageLayoutWidget =>
  ({
    id: 'widget',
    pageLayoutTabId: 'tab',
    applicationUniversalIdentifier: 'app',
    gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 12 },
    position: { layoutMode: PageLayoutTabLayoutMode.CANVAS },
    ...overrides,
  }) as FlatPageLayoutWidget;

describe('computeCanvasRecordPageTabsToVerticalList', () => {
  it('flips a CANVAS record-page tab to VERTICAL_LIST and indexes its widget', () => {
    const { tabsToUpdate, widgetsToUpdate } =
      computeCanvasRecordPageTabsToVerticalList({
        recordPageLayoutIds: new Set(['record-layout']),
        tabs: [makeTab({ id: 'tasks-tab' })],
        widgets: [makeWidget({ id: 'tasks-widget', pageLayoutTabId: 'tasks-tab' })],
      });

    expect(tabsToUpdate).toHaveLength(1);
    expect(tabsToUpdate[0].layoutMode).toBe(
      PageLayoutTabLayoutMode.VERTICAL_LIST,
    );
    expect(widgetsToUpdate).toHaveLength(1);
    expect(widgetsToUpdate[0].position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    });
  });

  it('leaves already vertical-list tabs untouched', () => {
    const result = computeCanvasRecordPageTabsToVerticalList({
      recordPageLayoutIds: new Set(['record-layout']),
      tabs: [
        makeTab({
          id: 'home-tab',
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        }),
      ],
      widgets: [makeWidget({ pageLayoutTabId: 'home-tab' })],
    });

    expect(result.tabsToUpdate).toHaveLength(0);
    expect(result.widgetsToUpdate).toHaveLength(0);
  });

  it('ignores CANVAS tabs that do not belong to a record page', () => {
    const result = computeCanvasRecordPageTabsToVerticalList({
      recordPageLayoutIds: new Set(['record-layout']),
      tabs: [makeTab({ id: 'dashboard-tab', pageLayoutId: 'dashboard-layout' })],
      widgets: [makeWidget({ pageLayoutTabId: 'dashboard-tab' })],
    });

    expect(result.tabsToUpdate).toHaveLength(0);
    expect(result.widgetsToUpdate).toHaveLength(0);
  });

  it('reindexes multiple widgets by grid position deterministically', () => {
    const { widgetsToUpdate } = computeCanvasRecordPageTabsToVerticalList({
      recordPageLayoutIds: new Set(['record-layout']),
      tabs: [makeTab({ id: 'multi-tab' })],
      // Provided out of visual order to prove the sort, not insertion order.
      widgets: [
        makeWidget({
          id: 'w-bottom',
          pageLayoutTabId: 'multi-tab',
          gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 12 },
        }),
        makeWidget({
          id: 'w-top',
          pageLayoutTabId: 'multi-tab',
          gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 12 },
        }),
      ],
    });

    expect(
      widgetsToUpdate.map((widget) => ({
        id: widget.id,
        position: widget.position,
      })),
    ).toEqual([
      {
        id: 'w-top',
        position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
      },
      {
        id: 'w-bottom',
        position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1 },
      },
    ]);
  });
});
