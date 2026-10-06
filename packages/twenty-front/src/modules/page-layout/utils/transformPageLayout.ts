import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export const transformPageLayout = (
  pageLayout: PageLayoutGenerated,
): PageLayout => {
  // The JSON scalar is typed any by codegen; the server validates the slot shape on save.
  const dashboardFilters = (pageLayout.dashboardFilters ?? null) as
    | DashboardFilterSlot[]
    | null;

  return {
    ...pageLayout,
    dashboardFilters,
    tabs: (pageLayout.tabs ?? [])
      .toSorted((a, b) => a.position - b.position)
      .map((tab): PageLayoutTab => {
        return {
          ...tab,
          widgets: tab.widgets ?? [],
        };
      }),
  };
};
