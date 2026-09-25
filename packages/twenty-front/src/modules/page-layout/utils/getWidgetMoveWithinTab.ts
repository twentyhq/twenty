import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getAdjacentFitContentWidgetIndex } from '@/page-layout/utils/getAdjacentFitContentWidgetIndex';
import { isWidgetEnabledByFeatureFlags } from '@/page-layout/utils/isWidgetEnabledByFeatureFlags';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';

type GetWidgetMoveWithinTabParams = {
  widgets: PageLayoutWidget[];
  widgetId: string;
  direction: 'up' | 'down';
  featureFlags: Record<string, boolean>;
};

// The neighbour is picked among the widgets edit mode renders, then both are
// addressed in the tab's full order: swapping with a widget a feature flag
// hides would leave the rendered order untouched.
export const getWidgetMoveWithinTab = ({
  widgets,
  widgetId,
  direction,
  featureFlags,
}: GetWidgetMoveWithinTabParams):
  | { fromIndex: number; toIndex: number }
  | undefined => {
  const sortedWidgets = sortWidgetsByVerticalListPosition(widgets);
  const renderedWidgets = sortedWidgets.filter((widget) =>
    isWidgetEnabledByFeatureFlags({ widget, featureFlags }),
  );

  const neighborRenderedIndex = getAdjacentFitContentWidgetIndex({
    widgets: renderedWidgets,
    widgetIndex: renderedWidgets.findIndex((widget) => widget.id === widgetId),
    direction,
  });

  if (!isDefined(neighborRenderedIndex)) {
    return undefined;
  }

  const neighborWidgetId = renderedWidgets[neighborRenderedIndex].id;

  return {
    fromIndex: sortedWidgets.findIndex((widget) => widget.id === widgetId),
    toIndex: sortedWidgets.findIndex(
      (widget) => widget.id === neighborWidgetId,
    ),
  };
};
