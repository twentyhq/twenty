import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useIsPageLayoutWidgetReadable } from '@/page-layout/hooks/useIsPageLayoutWidgetReadable';
import { useWidgetVisibilityContext } from '@/page-layout/hooks/useWidgetVisibilityContext';
import { useWidgetVisibilityFields } from '@/page-layout/hooks/useWidgetVisibilityFields';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const usePageLayoutTabWithVisibleWidgetsOrThrow = (
  tabId: string,
): PageLayoutTab => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const widgetVisibilityContext = useWidgetVisibilityContext();
  const widgetVisibilityFields = useWidgetVisibilityFields();
  const isWidgetReadable = useIsPageLayoutWidgetReadable();

  const tab = currentPageLayout.tabs.find((tab) => tab.id === tabId);

  const tabWithVisibleWidgets = useMemo(() => {
    if (!isDefined(tab)) {
      return undefined;
    }

    const activeWidgets = tab.widgets.filter((widget) => widget.isActive);

    const widgets = isPageLayoutInEditMode
      ? activeWidgets
      : filterVisibleWidgets({
          widgets: activeWidgets.filter(isWidgetReadable),
          context: widgetVisibilityContext,
          fields: widgetVisibilityFields,
        });

    return {
      ...tab,
      widgets:
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? sortWidgetsByVerticalListPosition(widgets)
          : widgets,
    };
  }, [
    isPageLayoutInEditMode,
    tab,
    widgetVisibilityContext,
    widgetVisibilityFields,
    isWidgetReadable,
  ]);

  if (!isDefined(tabWithVisibleWidgets)) {
    throw new Error(doNotTranslate('Tab not found'));
  }

  return tabWithVisibleWidgets;
};
