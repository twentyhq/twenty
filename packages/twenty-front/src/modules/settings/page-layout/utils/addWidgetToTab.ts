import {
  type PageLayoutTab,
  type PageLayoutWidget,
} from '../states/savedPageLayoutsState';

export const addWidgetToTab = (
  tabs: PageLayoutTab[],
  activeTabId: string,
  newWidget: PageLayoutWidget,
): PageLayoutTab[] => {
  return tabs.map((tab) => {
    if (tab.id === activeTabId) {
      return {
        ...tab,
        widgets: [...tab.widgets, newWidget],
      };
    }
    return tab;
  });
};
