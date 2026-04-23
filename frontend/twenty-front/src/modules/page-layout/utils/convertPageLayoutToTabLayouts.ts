import { DEFAULT_WIDGET_SIZE } from '@/page-layout/constants/DefaultWidgetSize';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';
import { isDefined } from 'twenty-shared/utils';

export const convertPageLayoutToTabLayouts = (
  pageLayout: PageLayout,
): TabLayouts => {
  if (pageLayout.tabs.length === 0) {
    return {};
  }

  const tabLayouts: TabLayouts = {};

  pageLayout.tabs.forEach((tab) => {
    const layouts = tab.widgets.map((widget) => {
      let minW = DEFAULT_WIDGET_SIZE.minimum.w;
      let minH = DEFAULT_WIDGET_SIZE.minimum.h;

      if (isDefined(widget.configuration)) {
        if (widget.configuration.__typename === 'FieldsConfiguration') {
          minW = DEFAULT_WIDGET_SIZE.minimum.w;
          minH = DEFAULT_WIDGET_SIZE.minimum.h;
        } else {
          const minimumSize = getWidgetSize(
            widget.configuration.configurationType,
            'minimum',
          );
          minW = minimumSize.w;
          minH = minimumSize.h;
        }
      }

      const gridPos =
        isDefined(widget.position) &&
        widget.position.__typename === 'PageLayoutWidgetGridPosition'
          ? {
              row: widget.position.row,
              column: widget.position.column,
              rowSpan: widget.position.rowSpan,
              columnSpan: widget.position.columnSpan,
            }
          : widget.gridPosition;

      return {
        i: widget.id,
        x: gridPos.column,
        y: gridPos.row,
        w: gridPos.columnSpan,
        h: gridPos.rowSpan,
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
