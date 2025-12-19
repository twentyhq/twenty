import { DEFAULT_WIDGET_SIZE } from '@/page-layout/constants/DefaultWidgetSize';
import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type TabLayouts } from '@/page-layout/types/tab-layouts';
import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated/graphql';

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

      if (widget.type === WidgetType.GRAPH && isDefined(widget.configuration)) {
        const graphType =
          'graphType' in widget.configuration
            ? widget.configuration.graphType
            : undefined;

        if (isDefined(graphType)) {
          const minimumSize = getWidgetSize(graphType, 'minimum');
          minW = minimumSize.w;
          minH = minimumSize.h;
        }
      }

      if (widget.type === WidgetType.IFRAME) {
        const iframeMinimumSize = WIDGET_SIZES[WidgetType.IFRAME]!.minimum;
        minW = iframeMinimumSize.w;
        minH = iframeMinimumSize.h;
      }

      if (widget.type === WidgetType.STANDALONE_RICH_TEXT) {
        const richTextMinimumSize =
          WIDGET_SIZES[WidgetType.STANDALONE_RICH_TEXT]!.minimum;
        minW = richTextMinimumSize.w;
        minH = richTextMinimumSize.h;
      }

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
