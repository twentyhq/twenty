import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';

type FilterVisibleWidgetsParams = {
  widgets: PageLayoutTab['widgets'];
  context: WidgetVisibilityContext;
};

export const filterVisibleWidgets = ({
  widgets,
  context,
}: FilterVisibleWidgetsParams): PageLayoutTab['widgets'] => {
  return widgets.filter((widget) => {
    return evaluateWidgetVisibility({
      conditionalDisplay: widget.conditionalDisplay,
      context,
    });
  });
};
