import { type PageLayoutTab } from '@/page-layout/types/pageLayoutTypes';
import { type PageLayoutWidget } from '~/generated/graphql';

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
