import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetVerticalListSizing } from '@/page-layout/widgets/utils/getWidgetVerticalListSizing';

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
    getWidgetVerticalListSizing(widgets[widgetIndex].type) !== 'FIT_CONTENT'
  ) {
    return undefined;
  }

  const adjacentFitContentWidgetIndex =
    direction === 'up'
      ? widgets.findLastIndex(
          (widget, index) =>
            index < widgetIndex &&
            getWidgetVerticalListSizing(widget.type) === 'FIT_CONTENT',
        )
      : widgets.findIndex(
          (widget, index) =>
            index > widgetIndex &&
            getWidgetVerticalListSizing(widget.type) === 'FIT_CONTENT',
        );

  return adjacentFitContentWidgetIndex >= 0
    ? adjacentFitContentWidgetIndex
    : undefined;
};
