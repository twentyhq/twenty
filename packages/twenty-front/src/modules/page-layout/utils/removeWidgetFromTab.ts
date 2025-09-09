import { type PageLayoutTab } from '../states/savedPageLayoutsState';

export const removeWidgetFromTab = (
  tabs: PageLayoutTab[],
  tabId: string,
  widgetId: string,
): PageLayoutTab[] => {
  return tabs.map((tab) => {
    if (tab.id === tabId) {
      return {
        ...tab,
        widgets: tab.widgets.filter((w) => w.id !== widgetId),
      };
    }
    return tab;
  });
};
