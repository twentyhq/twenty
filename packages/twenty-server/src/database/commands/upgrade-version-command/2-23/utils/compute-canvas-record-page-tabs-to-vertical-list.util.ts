import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

// Record-page tabs no longer store a CANVAS layout mode: presentation (solo vs
// stack) is derived from the widgets at render time. This flips legacy CANVAS
// tabs to VERTICAL_LIST and gives their widgets a vertical-list position so the
// stored shape matches everything the standard config now seeds.
export const computeCanvasRecordPageTabsToVerticalList = ({
  recordPageLayoutIds,
  tabs,
  widgets,
}: {
  recordPageLayoutIds: Set<string>;
  tabs: FlatPageLayoutTab[];
  widgets: FlatPageLayoutWidget[];
}): {
  tabsToUpdate: FlatPageLayoutTab[];
  widgetsToUpdate: FlatPageLayoutWidget[];
} => {
  const canvasRecordPageTabs = tabs.filter(
    (tab) =>
      recordPageLayoutIds.has(tab.pageLayoutId) &&
      tab.layoutMode === PageLayoutTabLayoutMode.CANVAS,
  );

  const canvasTabIds = new Set(canvasRecordPageTabs.map((tab) => tab.id));

  const tabsToUpdate = canvasRecordPageTabs.map((tab) => ({
    ...tab,
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  }));

  const widgetsByTabId = new Map<string, FlatPageLayoutWidget[]>();

  for (const widget of widgets) {
    if (!canvasTabIds.has(widget.pageLayoutTabId)) {
      continue;
    }

    const tabWidgets = widgetsByTabId.get(widget.pageLayoutTabId) ?? [];

    widgetsByTabId.set(widget.pageLayoutTabId, [...tabWidgets, widget]);
  }

  const widgetsToUpdate: FlatPageLayoutWidget[] = [];

  for (const tabWidgets of widgetsByTabId.values()) {
    // Cache/DB iteration order is not stable, so derive a deterministic
    // vertical-list order from the legacy grid position (row, then column) with
    // the widget id as a final tie-breaker before assigning indexes.
    const orderedTabWidgets = [...tabWidgets].sort((widgetA, widgetB) => {
      const rowDifference =
        (widgetA.gridPosition?.row ?? 0) - (widgetB.gridPosition?.row ?? 0);

      if (rowDifference !== 0) {
        return rowDifference;
      }

      const columnDifference =
        (widgetA.gridPosition?.column ?? 0) -
        (widgetB.gridPosition?.column ?? 0);

      if (columnDifference !== 0) {
        return columnDifference;
      }

      return widgetA.id.localeCompare(widgetB.id);
    });

    orderedTabWidgets.forEach((widget, index) => {
      widgetsToUpdate.push({
        ...widget,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index,
        },
      });
    });
  }

  return { tabsToUpdate, widgetsToUpdate };
};
