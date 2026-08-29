import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { buildTabWidgetLayouts } from '@/page-layout/utils/buildTabWidgetLayouts';

export const convertPageLayoutToTabLayouts = (
  pageLayout: PageLayout,
): TabLayouts => {
  if (pageLayout.tabs.length === 0) {
    return {};
  }

  const tabLayouts: TabLayouts = {};

  pageLayout.tabs.forEach((tab) => {
    tabLayouts[tab.id] = buildTabWidgetLayouts(tab.widgets);
  });

  return tabLayouts;
};
