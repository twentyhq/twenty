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

  it('reindexes multiple widgets within a migrated tab', () => {
    const { widgetsToUpdate } = computeCanvasRecordPageTabsToVerticalList({
      recordPageLayoutIds: new Set(['record-layout']),
      tabs: [makeTab({ id: 'multi-tab' })],
      widgets: [
        makeWidget({ id: 'w1', pageLayoutTabId: 'multi-tab' }),
        makeWidget({ id: 'w2', pageLayoutTabId: 'multi-tab' }),
      ],
    });

    expect(widgetsToUpdate.map((widget) => widget.position)).toEqual([
      { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
      { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1 },
    ]);
  });
});
