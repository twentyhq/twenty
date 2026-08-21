import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const shouldShowAddWidgetBelow = ({
  currentTab,
  pageLayoutEditingWidgetId,
}: {
  currentTab: PageLayoutTab | undefined;
  pageLayoutEditingWidgetId: string | null;
}): boolean => {
  if (
    !isDefined(currentTab) ||
    currentTab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST ||
    !isDefined(pageLayoutEditingWidgetId)
  ) {
    return false;
  }

  const currentWidget = currentTab.widgets.find(
    (widget) => widget.id === pageLayoutEditingWidgetId,
  );

  return (
    isDefined(currentWidget) && !isViewportFillingWidgetType(currentWidget.type)
  );
};
