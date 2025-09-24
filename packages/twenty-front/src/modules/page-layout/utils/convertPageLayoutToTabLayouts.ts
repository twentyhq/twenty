import { type PageLayout } from '@/page-layout/types/pageLayoutTypes';
import { type TabLayouts } from '@/page-layout/types/tab-layouts';

export const convertPageLayoutToTabLayouts = (
  pageLayout: PageLayout,
): TabLayouts => {
  if (pageLayout.tabs.length === 0) {
    return {};
  }

  const tabLayouts: TabLayouts = {};

  pageLayout.tabs.forEach((tab) => {
    const layouts = tab.widgets.map((widget) => ({
      i: widget.id,
      x: widget.gridPosition.column,
      y: widget.gridPosition.row,
      w: widget.gridPosition.columnSpan,
      h: widget.gridPosition.rowSpan,
    }));

    tabLayouts[tab.id] = {
      desktop: layouts,
      mobile: layouts.map((layout) => ({ ...layout, w: 1, x: 0 })),
    };
  });

  return tabLayouts;
};
