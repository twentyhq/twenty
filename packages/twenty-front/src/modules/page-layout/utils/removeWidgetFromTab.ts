import { type PageLayoutTabWithData } from '../types/pageLayoutTypes';

export const removeWidgetFromTab = (
  tabs: PageLayoutTabWithData[],
  tabId: string,
  widgetId: string,
): PageLayoutTabWithData[] => {
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
