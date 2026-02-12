import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export const transformPageLayout = (
  pageLayout: PageLayoutGenerated,
): PageLayout => {
  return {
    ...pageLayout,
    tabs: (pageLayout.tabs ?? [])
      .toSorted((a, b) => a.position - b.position)
      .map((tab): PageLayoutTab => {
        // TODO: remove this once the frontend consumes the new type
        const { layoutMode: _layoutMode, ...tabWithoutLayoutMode } = tab;

        return {
          ...tabWithoutLayoutMode,
          widgets: tab.widgets ?? [],
        };
      }),
  };
};
