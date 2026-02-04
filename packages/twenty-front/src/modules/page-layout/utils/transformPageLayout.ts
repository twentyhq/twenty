import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayout, type PageLayout as PageLayoutGenerated } from '~/generated/graphql';

export const transformPageLayout = (
  pageLayout: PageLayoutGenerated,
): PageLayout => {
  return {
    ...pageLayout,
    tabs: (pageLayout.tabs ?? [])
      .toSorted((a, b) => a.position - b.position)
      .map((tab): PageLayoutTab => {
        return {
          ...tab,
          widgets: tab.widgets ?? [],
          layoutMode: tab.layoutMode ?? undefined,
        };
      }),
  };
};
