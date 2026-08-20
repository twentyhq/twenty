import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetLayoutBehavior } from '@/page-layout/widgets/utils/getWidgetLayoutBehavior';

type GetAdjacentExpandableWidgetIndexParams = {
  widgets: PageLayoutWidget[];
  widgetIndex: number;
  direction: 'up' | 'down';
};

export const getAdjacentExpandableWidgetIndex = ({
  widgets,
  widgetIndex,
  direction,
}: GetAdjacentExpandableWidgetIndexParams): number | undefined => {
  if (
    !(widgetIndex in widgets) ||
    getWidgetLayoutBehavior(widgets[widgetIndex].type) !== 'EXPANDABLE'
  ) {
    return undefined;
  }

  const adjacentExpandableWidgetIndex =
    direction === 'up'
      ? widgets.findLastIndex(
          (widget, index) =>
            index < widgetIndex &&
            getWidgetLayoutBehavior(widget.type) === 'EXPANDABLE',
        )
      : widgets.findIndex(
          (widget, index) =>
            index > widgetIndex &&
            getWidgetLayoutBehavior(widget.type) === 'EXPANDABLE',
        );

  return adjacentExpandableWidgetIndex >= 0
    ? adjacentExpandableWidgetIndex
    : undefined;
};
