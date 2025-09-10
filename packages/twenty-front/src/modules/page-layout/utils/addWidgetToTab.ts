import {
  type PageLayoutTabWithData,
  type PageLayoutWidgetWithData,
} from '../types/pageLayoutTypes';

export const addWidgetToTab = (
  tabs: PageLayoutTabWithData[],
  activeTabId: string,
  newWidget: PageLayoutWidgetWithData,
): PageLayoutTabWithData[] => {
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
