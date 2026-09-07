import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { reindexWidgetsToVerticalListPositions } from '@/page-layout/utils/reindexWidgetsToVerticalListPositions';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const addWidgetToTab = (
  tabs: PageLayoutTab[],
  activeTabId: string,
  newWidget: PageLayoutWidget,
): PageLayoutTab[] => {
  return tabs.map((tab) => {
    if (tab.id === activeTabId) {
      const existingWidgets =
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? sortWidgetsByVerticalListPosition(tab.widgets)
          : tab.widgets;
      const insertionIndex =
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
        isDefined(newWidget.position) &&
        isVerticalListPosition(newWidget.position)
          ? newWidget.position.index
          : existingWidgets.length;
      const widgets = existingWidgets.toSpliced(insertionIndex, 0, newWidget);

      return {
        ...tab,
        widgets:
          tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
            ? reindexWidgetsToVerticalListPositions(widgets)
            : widgets,
      };
    }
    return tab;
  });
};
