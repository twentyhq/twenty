import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';

export const filterVisibleWidgets = (
  widgets: PageLayoutTab['widgets'],
  context: WidgetVisibilityContext,
): PageLayoutTab['widgets'] => {
  return widgets.filter((widget) => {
    return evaluateWidgetVisibility({
      conditionalDisplay: widget.conditionalDisplay,
      context,
    });
  });
};
