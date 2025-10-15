import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type TabLayouts } from '@/page-layout/types/tab-layouts';
import { getWidgetMinimumSize } from '@/page-layout/utils/getWidgetMinimumSize';

export const convertPageLayoutToTabLayouts = (
  pageLayout: PageLayout,
): TabLayouts => {
  if (pageLayout.tabs.length === 0) {
    return {};
  }

  const tabLayouts: TabLayouts = {};

  pageLayout.tabs.forEach((tab) => {
    const layouts = tab.widgets.map((widget) => {
      const { minW, minH } = getWidgetMinimumSize(widget);

      return {
        i: widget.id,
        x: widget.gridPosition.column,
        y: widget.gridPosition.row,
        w: widget.gridPosition.columnSpan,
        h: widget.gridPosition.rowSpan,
        minW,
        minH,
      };
    });

    tabLayouts[tab.id] = {
      desktop: layouts,
      mobile: layouts.map((layout) => ({ ...layout, w: 1, x: 0 })),
    };
  });

  return tabLayouts;
};
