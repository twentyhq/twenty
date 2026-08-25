import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';

type GetAdjacentFitContentWidgetIndexParams = {
  widgets: PageLayoutWidget[];
  widgetIndex: number;
  direction: 'up' | 'down';
};

export const getAdjacentFitContentWidgetIndex = ({
  widgets,
  widgetIndex,
  direction,
}: GetAdjacentFitContentWidgetIndexParams): number | undefined => {
  if (
    !(widgetIndex in widgets) ||
    isViewportFillingWidgetType(widgets[widgetIndex].type)
  ) {
    return undefined;
  }

  const adjacentFitContentWidgetIndex =
    direction === 'up'
      ? widgets.findLastIndex(
          (widget, index) =>
            index < widgetIndex && !isViewportFillingWidgetType(widget.type),
        )
      : widgets.findIndex(
          (widget, index) =>
            index > widgetIndex && !isViewportFillingWidgetType(widget.type),
        );

  return adjacentFitContentWidgetIndex >= 0
    ? adjacentFitContentWidgetIndex
    : undefined;
};
