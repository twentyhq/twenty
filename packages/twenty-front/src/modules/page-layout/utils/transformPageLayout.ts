import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayout as PageLayoutGenerated } from '~/generated/graphql';

export const transformPageLayout = (
  pageLayout: PageLayoutGenerated,
): PageLayout => {
  return {
    ...pageLayout,
    tabs: (pageLayout.tabs ?? []).map(
      (tab): PageLayoutTab => ({
        ...tab,
        widgets: tab.widgets ?? [],
      }),
    ),
  };
};
