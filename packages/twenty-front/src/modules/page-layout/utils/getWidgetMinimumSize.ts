import { WIDGET_MINIMUM_SIZES } from '@/page-layout/constants/WidgetMinimumSizes';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidget, WidgetType } from '~/generated/graphql';

export const getWidgetMinimumSize = (
  widget: PageLayoutWidget,
): { minW: number; minH: number } => {
  if (widget.type === WidgetType.GRAPH && isDefined(widget.configuration)) {
    const graphType =
      'graphType' in widget.configuration
        ? widget.configuration.graphType
        : undefined;

    if (isDefined(graphType) && graphType in WIDGET_MINIMUM_SIZES.GRAPH) {
      return WIDGET_MINIMUM_SIZES.GRAPH[graphType];
    }
  }

  return WIDGET_MINIMUM_SIZES.DEFAULT;
};
