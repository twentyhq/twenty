import { evaluateConditionalAvailabilityNode } from 'twenty-shared/utils';

import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type FilterVisibleWidgetsParams = {
  widgets: PageLayoutTab['widgets'];
  context: WidgetVisibilityContext;
};

export const filterVisibleWidgets = ({
  widgets,
  context,
}: FilterVisibleWidgetsParams): PageLayoutTab['widgets'] => {
  return widgets.filter((widget) =>
    evaluateConditionalAvailabilityNode({
      node: widget.conditionalAvailability,
      context,
    }),
  );
};
