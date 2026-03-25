import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const addWidgetToTab = (
  tabs: PageLayoutTab[],
  activeTabId: string,
  newWidget: PageLayoutWidget,
): PageLayoutTab[] => {
  return tabs.map((tab) => {
    if (tab.id === activeTabId) {
      return {
        ...tab,
        widgets: [...(tab?.widgets ?? []), newWidget],
      };
    }
    return tab;
  });
};
