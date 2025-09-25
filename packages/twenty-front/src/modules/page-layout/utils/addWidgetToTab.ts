import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type Widget } from '@/page-layout/widgets/types/Widget';

export const addWidgetToTab = (
  tabs: PageLayoutTab[],
  activeTabId: string,
  newWidget: Widget,
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
