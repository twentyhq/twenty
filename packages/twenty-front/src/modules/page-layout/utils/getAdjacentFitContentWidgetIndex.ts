import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidget } from '@/page-layout/widgets/utils/isViewportFillingWidget';

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
    isViewportFillingWidget(widgets[widgetIndex])
  ) {
    return undefined;
  }

  const adjacentFitContentWidgetIndex =
    direction === 'up'
      ? widgets.findLastIndex(
          (widget, index) =>
            index < widgetIndex && !isViewportFillingWidget(widget),
        )
      : widgets.findIndex(
          (widget, index) =>
            index > widgetIndex && !isViewportFillingWidget(widget),
        );

  return adjacentFitContentWidgetIndex >= 0
    ? adjacentFitContentWidgetIndex
    : undefined;
};
